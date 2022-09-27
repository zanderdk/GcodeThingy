<script lang="ts">
    import "carbon-components-svelte/css/g90.css";
    import { Button, ButtonSet } from "carbon-components-svelte";
    import Highlight from "svelte-highlight";
    import gcode from "svelte-highlight/languages/typescript";
    import obsidian from "svelte-highlight/styles/obsidian";
    import Fa from "svelte-fa";
    import { faDownload, faCopy } from "@fortawesome/free-solid-svg-icons";
    import InputComponent, { type MacroType } from "./lib/InputComponent.svelte";

    function fileChange(e: CustomEvent<string>) {
        let content: string = e.detail;
        console.log(content);
    }

    let xPitch: number = 25;
    let yPitch: number = 25;
    let xAmount: number = 1;
    let yAmount: number = 1;
    let beforeLoopCode: string = "";
    let afterLoopCode: string = "";
    let selectedMacro: MacroType = 1;

    const code = `%O0405%`;
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
    <h2 style="padding-bottom: 1.5rem;">Output</h2>

    <ButtonSet>
        <Button kind="primary"><Fa icon={faDownload} /> Download</Button>
        <Button kind="primary"><Fa icon={faCopy} /> Copy</Button>
    </ButtonSet>
    <br />
    <Highlight language={gcode} {code} />
</main>

<style>
</style>
