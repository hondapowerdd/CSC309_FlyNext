import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";

export async function saveFilePublic(pathUnderPublic, file) {
    const filename = Date.now().toString() + extname(file.name);
    const saveDir = join(process.cwd(), 'public', pathUnderPublic);

    await mkdir(saveDir, { recursive: true });

    await writeFile(
        join(saveDir, filename),
        Buffer.from(await file.arrayBuffer())
    );

    return filename;
}