import { rm, mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";

export async function saveFilePublic(pathUnderPublic, file, fileNo="") {
    // Given a path (under the public folder), save the file.
    // Return the saved filename (the time of processing in nanoseconds).

    const filename = Date.now().toString() + fileNo + extname(file.name);
    const saveDir = join(process.cwd(), 'public', pathUnderPublic);

    // clear the dir
    await rm(saveDir, { recursive: true, force: true });
    // Ensure folder exist
    await mkdir(saveDir, { recursive: true });

    await writeFile(
        join(saveDir, filename),
        Buffer.from(await file.arrayBuffer())
    );

    return filename;
}