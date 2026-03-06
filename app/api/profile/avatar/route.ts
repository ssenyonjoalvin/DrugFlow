import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 3 * 1024 * 1024; // 3MB

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, GIF, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 3MB." },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpeg", "jpg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const fileName = `${session.user.id}.${safeExt}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, fileName);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));

  const avatarUrl = `/uploads/avatars/${fileName}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl },
  });

  return NextResponse.json({ url: avatarUrl });
}
