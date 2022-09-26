<script lang="ts">
    import { onMount, createEventDispatcher } from "svelte";
 // import { onFileLoadFunction } from "./types";

    let files: FileList;
    let fileInput: HTMLInputElement;

    type onFileLoadFunction = ((a: string) => Promise<void>) | ((a: string) => void);

    export let onload: onFileLoadFunction | null = null;

    async function main() {
        console.debug("mounted app");
        fileInput.addEventListener("change", async (evt: Event) => {
            const fileData: string = await GetFileData(files[0]);
            console.assert(!!onload, "onload is not set");
            if (onload) {
                onload(fileData);
            }
        });
    }

    async function GetFileData(file: File): Promise<string> {
        let p: Promise<string> = new Promise((res, _) => {
            const reader = new FileReader();
            reader.onload = async (e: Event) => {
                let fr: FileReader = e.target;
                res(fr.result as string);
            };
            reader.readAsText(file, "UTF-8");
        });
        return p;
    }

    onMount(main);
</script>

<input bind:this={fileInput} type="file" bind:files />
