<script lang="ts">
    import "carbon-components-svelte/css/g90.css";
    import obsidian from "svelte-highlight/styles/obsidian";
    import InputComponent, { MacroType } from "./lib/InputComponent.svelte";
    import OutputComponent from "./lib/OutputComponent.svelte";
    import {
        parseGcode,
        multiply,
        insertCustomGcodeBefore,
        insertCustomGcodeAfter,
    } from "./lib/engine";
    import { BlockType, Routine } from "./lib/types";

    let xPitch: number = 25;
    let yPitch: number = 25;
    let xAmount: number = 1;
    let yAmount: number = 1;
    let beforeLoopCode: string = "";
    let afterLoopCode: string = "";
    let selectedMacro: MacroType = 1;

    let content: string = "";

    $: routine = (content.trim())? outputUpdate(content, xAmount, yAmount, xPitch, yPitch, beforeLoopCode, afterLoopCode) : null;

    function onChange(e: CustomEvent<string>) {
        content = e.detail;
    }

    function outputUpdate(
        _content: string,
        _xAmount: number,
        _yAmount: number,
        _xPitch: number,
        _yPitch: number,
        _beforeLoopCode: string,
        _afterLoopCode: string
    ): Routine {
        let gcode = [_content]
            .map(parseGcode)
            .map((gc) => multiply(gc, _xAmount, _yAmount, _xPitch, _yPitch))
            .map((gc) =>
                insertCustomGcodeAfter(gc, _beforeLoopCode, BlockType.LoopStart)
            )
            .map((gc) =>
                insertCustomGcodeBefore(gc, _afterLoopCode, BlockType.LoopEnd)
            )[0];

        console.debug("generated:", routine);
        return gcode;
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
        on:change={onChange}
    />
    <OutputComponent bind:routine />
</main>

<style>
</style>
