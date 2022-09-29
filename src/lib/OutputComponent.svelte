<script lang="ts" context="module">
</script>

<script lang="ts">
    import Fa from "svelte-fa";
    import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
    import {
        Button,
        ButtonSet,
        ComposedModal,
        ModalHeader,
    } from "carbon-components-svelte";
    import type { Routine } from "./types";
    import { onMount } from "svelte";
 // import './prism';
    import "./prism.css";
    import Prism from 'prismjs';
    import 'prismjs/components/prism-gcode';
    import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
    import 'prismjs/plugins/line-numbers/prism-line-numbers.css';

    function main() {
    }

    onMount(main);

   let modalOpen = false;

    export let routine: Routine | null = null;
    $: code = routine ? "\n" + routine.toString().trim() : "";

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

    function onInput(e) {
         const editable = document.getElementById("editable");
        console.log(editable);
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
        <pre
            class="line-numbers"
            style="background-color: #222222;"
        >
            {@html Prism.highlight(code, Prism.languages.gcode, 'gcode')}
        </pre>
{/if}

<ComposedModal bind:open={modalOpen}>
    <ModalHeader title={modalText} />
</ComposedModal>

<style>
  pre {
    white-space: pre-wrap;
  }
</style>
