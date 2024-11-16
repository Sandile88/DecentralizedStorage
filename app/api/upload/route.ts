import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const bodyParser = false;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chunkIndex = formData.get('chunkIndex');
    const totalChunks = formData.get('totalChunks');
    const fileId = formData.get('fileId');
    
    const uuid = crypto.randomUUID();
    const keyData = await pinata.keys.create({
      keyName: uuid.toString(),
      permissions: {
        endpoints: {
          pinning: {
            pinFileToIPFS: true,
          },
        },
      },
      maxUses: 1,
    });

    const upload = await pinata.upload.file(file).key(keyData.JWT);
    
    return NextResponse.json({ 
      success: true, 
      ipfsHash: upload.IpfsHash,
      chunkIndex,
      totalChunks
    });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}