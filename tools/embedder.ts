import * as embedder from "@nfnitloop/deno-embedder"

const options = {
    importMeta: import.meta,
    mappings: [
        {
            sourceDir: "../static",
            destDir: "../embed/static"
        },
    ]
}

if (import.meta.main) {
    await embedder.main({options, args: ['build']})
}