
import { NextResponse } from "next/server";
import { uploadToFilebase, uploadJSONToFilebase } from "@/lib/filebase";
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const tokenId = (formData.get("tokenId") as string) || Date.now().toString();
    const isPhysical = formData.get("isPhysical") === "true";
    if (!files.length) return NextResponse.json({ error: "No files" }, { status: 400 });
    const uploads = [];
    for (let i = 0; i < files.length; i++) {
      const buffer = Buffer.from(await files[i].arrayBuffer());
      const res = await uploadToFilebase(buffer, `${tokenId}-${i}-${files[i].name}`, files[i].type, `physical/${tokenId}`);
      uploads.push(res);
    }
    const metadata = {
      name: `FaNFT #${tokenId}`,
      description: "FaNFT - fanft.site - Physical to Digital",
      image: uploads[0].gatewayUrl,
      external_url: `https://fanft.site/verify/${tokenId}`,
      attributes: [{ trait_type: "isPhysical", value: isPhysical ? "Yes" : "No" }],
    };
    const metaUpload = await uploadJSONToFilebase(metadata, `${tokenId}.json`, "metadata");
    return NextResponse.json({
      success: true,
      tokenId,
      uploads,
      tokenURI: metaUpload.gatewayUrl,
      gateway: "https://fanft-assets.myfilebase.com/",
      contract: "0xd9145CCE52D386f254917e481eB44e9943F39138",
      verifyUrl: `https://fanft.site/verify/${tokenId}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
