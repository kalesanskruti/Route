import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireRole } from "@/lib/auth-helpers";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate & Verify Role
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "TRANSPORT_MANAGER"]);

    // 2. Verify Content-Type & Parse FormData
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid Content-Type. Must be multipart/form-data." },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 3. Validate File Type
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, JPG, and PNG are allowed." },
        { status: 400 }
      );
    }

    // 4. Validate File Size (< 5MB)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File too large. Max size is 5MB." },
        { status: 400 }
      );
    }

    // 5. Ensure Upload Directory Exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "documents");
    await fs.mkdir(uploadDir, { recursive: true });

    // 6. Write File with Unique Name
    const uniqueFilename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const destinationPath = path.join(uploadDir, uniqueFilename);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    await fs.writeFile(destinationPath, buffer);

    // 7. Return Relative Access URL
    const relativeUrl = `/uploads/documents/${uniqueFilename}`;
    return NextResponse.json({ url: relativeUrl });
  } catch (error: any) {
    console.error("File upload error:", error);
    if (error.name === "AuthError") {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
