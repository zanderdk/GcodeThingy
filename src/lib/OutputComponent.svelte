<script lang="ts">
    import Fa from "svelte-fa";
    import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
    import {
        Button,
        ButtonSet,
        ComposedModal,
        ModalHeader,
    } from "carbon-components-svelte";
    import gcode from "svelte-highlight/languages/typescript";
    import Highlight from "svelte-highlight";
    import { Routine } from "./types";

    let modalOpen = false;

    export let routine: Routine | null = null;
    $: code = routine ? routine.toString() : "";

    let modalText = "";

    function copy(text: string) {
        navigator.clipboard.writeText(text).then(
            function () {
                modalText = "Gcode copied to clipboard";
                modalOpen = true;
            },
            function (err) {
                modalText = "Gcode could not be copied to clipboard";
                modalOpen = true;
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

<ComposedModal bind:open={modalOpen}>
    <ModalHeader title={modalText} />
</ComposedModal>
