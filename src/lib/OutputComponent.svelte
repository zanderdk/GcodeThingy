<script lang="ts">
    import Fa from "svelte-fa";
    import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
    import { Button, ButtonSet } from "carbon-components-svelte";
    import gcode from "svelte-highlight/languages/typescript";
    import Highlight from "svelte-highlight";
    import { Routine } from "./types";

    export let routine: Routine | null = null;
    $: code = routine ? routine.toString() : "";

    function copy(text: string) {
        navigator.clipboard.writeText(text).then(
            function () {
                console.log("Async: Copying to clipboard was successful!");
            },
            function (err) {
                console.error("Async: Could not copy text: ", err);
            }
        );
    }

    function download(filename: string, text: string) {
        console.log("filename:", filename);
        var element = document.createElement("a");
        element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(text)
        );
        element.setAttribute("download", filename);

        element.style.display = "none";
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    function downloadGcode() {
        if (routine.name) {
            download(`${routine.name}.nc`, code);
            return;
        }
        download("output.nc", code);
    }

</script>

{#if code}
    <ButtonSet>
        <Button kind="primary" on:click={(e) => downloadGcode()}
            ><Fa icon={faDownload} /> Download</Button
        >
        <Button kind="primary" on:click={(e) => copy(code)}
            ><Fa icon={faCopy} /> Copy</Button
        >
    </ButtonSet>
    <br />
    <Highlight language={gcode} {code} />
{/if}
