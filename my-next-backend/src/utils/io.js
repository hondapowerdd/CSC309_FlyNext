import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";

export async function saveFilePublic(pathUnderPublic, file) {
    // Given a path (under the public folder), save the file.
    // Return the saved filename (the time of processing in nanoseconds).

    const filename = Date.now().toString() + extname(file.name);
    const saveDir = join(process.cwd(), 'public', pathUnderPublic);

    // Ensure folder exist
    await mkdir(saveDir, { recursive: true });

    await writeFile(
        join(saveDir, filename),
        Buffer.from(await file.arrayBuffer())
    );

    return filename;
}