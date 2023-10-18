/**
 * No valid kind was determined during the execution of {@link kindFromName}.
 */
export class UnknownFileKindError extends Error {}


/**
 * Try to determine the {@link VaultFile.kind} from a file's name.
 *
 * @param name {string} The file name to use.
 * @returns {"card"|"canvas"} The successfully determined file type.
 */
function kindFromName(name) {
    if(name.endsWith(".md")) return "card"
    else if(name.endsWith(".canvas")) return "canvas"
    throw UnknownFileKindError("No file type matched the given file name.")
}

/**
 * A file contained in an Obsidian Vault.
 */
export class VaultFile {
    /**
     * The type of file.
     *
     * @type {"card"|"canvas"}
     */
    kind

    /**
     * The name of the file.
     *
     * @type {string}
     */
    name

    /**
     * The contents of the file.
     *
     * To be interpreted differently depending on the {@link kind} of the object.
     *
     * @type {any}
     */
    contents

    constructor({ kind, name, contents }) {
        this.kind = kind
        this.name = name
        this.contents = contents
    }
}


/**
 * An error which occoured during a {@link fetch} request.
 */
export class VaultFetchError extends Error {
    /**
     * The {@link Response} object of the failed request.
     */
    response

    constructor(response, message) {
        super(message);
    }
}

/**
 * Fetch a {@link VaultFile} from the given {@link URL}.
 *
 * @param fileURL {URL} The URL where the file is accessible at.
 * @returns {VaultFile} The fetched {@link VaultFile}.
 */
async function fetchVaultFile(fileURL) {
    const response = await fetch(fileURL, {})

    if(!response.ok) throw new VaultFetchError(response, "Fetch response is not ok")

    const contents = await response.text()
    const name = fileURL.pathname.split("/").at(-1)
    const kind = kindFromName(name)

    return new VaultFile({kind, name, contents})
}

/**
 * A cache mapping file URLs to {@link VaultFile}s.
 *
 * @type {{[fileURL: URL]: VaultFile}}
 */
const VAULT_CACHE = {}

/**
 * Try to get a {@link VaultFile} from the {@link VAULT_CACHE}, then, if it isn't available, {@link fetchVaultFile} it.
 *
 * @param fileURL {URL} The URL where the file should be accessible at.
 * @returns {VaultFile} The fetched {@link VaultFile}
 */
export async function getVaultFile(fileURL) {
    const cached = VAULT_CACHE[fileURL]

    if(cached !== undefined) return cached

    const vaultFile = fetchVaultFile(fileURL)
    VAULT_CACHE[fileURL] = vaultFile
    return vaultFile
}