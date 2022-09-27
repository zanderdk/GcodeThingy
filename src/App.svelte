<script lang="ts">
    import "carbon-components-svelte/css/g90.css";
    import { Button, ButtonSet } from "carbon-components-svelte";
    import Highlight from "svelte-highlight";
    import gcode from "svelte-highlight/languages/typescript";
    import obsidian from "svelte-highlight/styles/obsidian";
    import Fa from "svelte-fa";
    import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
    import InputComponent, { MacroType } from "./lib/InputComponent.svelte";
    import {
        parseGcode,
        multiply,
        insertCustomGcodeBefore,
        insertCustomGcodeAfter,
    } from "./lib/engine";
    import { BlockType, Routine } from "./lib/engine";

    let routine: Routine | null = null;
    $: code = routine ? routine.toString() : "";

    let xPitch: number = 25;
    let yPitch: number = 25;
    let xAmount: number = 1;
    let yAmount: number = 1;
    let beforeLoopCode: string = "";
    let afterLoopCode: string = "";
    let selectedMacro: MacroType = 1;

    function fileChange(e: CustomEvent<string>) {
        let content: string = e.detail;

        let gcode = [content]
            .map(parseGcode)
            .map((gc) => multiply(gc, xAmount, yAmount, xPitch, yPitch))
            .map((gc) =>
                insertCustomGcodeAfter(gc, beforeLoopCode, BlockType.LoopStart)
            )
            .map((gc) =>
                insertCustomGcodeBefore(gc, afterLoopCode, BlockType.LoopEnd)
            )[0];

        routine = gcode;
        console.debug("generated:", routine);
    }

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

<svelte:head>
    {@html obsidian}
</svelte:head>

<main style="">
    <h2 style="padding-bottom: 1.5rem;">Settings</h2>
    <InputComponent
        bind:xAmount
        bind:yAmount
        bind:xPitch
        bind:yPitch
        bind:afterLoopCode
        bind:beforeLoopCode
        bind:selectedMacro
        on:change={fileChange}
    />

    {#if code}
        <h2 style="padding-bottom: 1.5rem;">Output</h2>
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
</main>

<style>
</style>
