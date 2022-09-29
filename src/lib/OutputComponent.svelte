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
    import { afterUpdate } from "svelte";
    import CodeEditor from 'svelte-code-editor';
    import { createEventDispatcher } from "svelte";
    import 'prismjs/components/prism-gcode';

    const dispatch = createEventDispatcher<{change: string}>();
    interface $$Events {
        change: CustomEvent<string>;
    }

    async function updateFunc() {
        let boxes: any[] = document.querySelectorAll('.codejar-linenumbers');
        console.log(boxes);
        boxes.forEach(box => {
            box.style.width = '65px';
        });

        boxes = document.querySelectorAll('pre');

        boxes.forEach(box => {
            box.style['padding-left'] = '80px';
        });
        console.log(boxes);
    }

    afterUpdate(updateFunc);

    let modalOpen = false;

    export let routine: Routine | null = null;
    $: code = routine ? routine.toString().trim() : "";

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

    let timer = null;
    function codeChange(e: any) {
        if (timer) {
            clearTimeout(timer);
        }
        console.log("setting timer");
        timer = setTimeout( () => {
            console.log("time out");
            dispatch("change", e.detail);
        } , 2000);
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
    <CodeEditor style="" lang="gcode" bind:code loc={true} tab="\t" on:change={codeChange} />
{/if}

<ComposedModal bind:open={modalOpen}>
    <ModalHeader title={modalText} />
</ComposedModal>
