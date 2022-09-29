<script lang="ts">
    import "carbon-components-svelte/css/g90.css";
    import obsidian from "svelte-highlight/styles/obsidian";
    import InputComponent from "./lib/InputComponent.svelte";
    import OutputComponent from "./lib/OutputComponent.svelte";
    import { parseGcode, multiply } from "./lib/engine";
    import { BlockType, Routine, MacroType } from "./lib/types";
    import {
        insertCustomGcodeBefore,
        insertCustomGcodeAfter,
    } from "./lib/utils";
    import gcode from "svelte-highlight/languages/typescript";
    import Highlight from "svelte-highlight";
    import { Column, Grid, Row } from "carbon-components-svelte";

    let xPitch: number = 25;
    let yPitch: number = 25;
    let xAmount: number = 1;
    let yAmount: number = 1;
    let beforeLoopCode: string = "";
    let afterLoopCode: string = "";
    let selectedMacro: MacroType = 1;

    let content: string = "";
    let oldContent: string = "";

    $: routine = content.trim()
        ? outputUpdate(
              content,
              xAmount,
              yAmount,
              xPitch,
              yPitch,
              beforeLoopCode,
              afterLoopCode,
              selectedMacro
          )
        : null;
    $: originalCode = content.trim() ? parseGcode(content) : null;

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
        _afterLoopCode: string,
        _selectedMacro: MacroType
    ): Routine {
        if (_content != oldContent) {
            oldContent = _content;
            let gcode = [_content]
                .map(parseGcode)
                .map((gc) =>
                    multiply(
                        gc,
                        _xAmount,
                        _yAmount,
                        _xPitch,
                        _yPitch,
                        _selectedMacro
                    )
                )
                .map((gc) =>
                    insertCustomGcodeAfter(
                        gc,
                        _beforeLoopCode,
                        BlockType.LoopStart
                    )
                )
                .map((gc) =>
                    insertCustomGcodeBefore(
                        gc,
                        _afterLoopCode,
                        BlockType.LoopEnd
                    )
                )[0];
            console.debug("generating:", gcode);
            return gcode;
        }
        let gcode = [routine]
            .map((gc) =>
                multiply(
                    gc,
                    _xAmount,
                    _yAmount,
                    _xPitch,
                    _yPitch,
                    _selectedMacro,
                    true
                )
            )
            .map((gc) =>
                insertCustomGcodeAfter(gc, _beforeLoopCode, BlockType.LoopStart)
            )
            .map((gc) =>
                insertCustomGcodeBefore(gc, _afterLoopCode, BlockType.LoopEnd)
            )[0];

        console.debug("updating:", gcode);
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
    <Grid>
        <Row>
            <Column>
                {#if originalCode}
                <h2 style="padding-bottom: 1.5rem;">Input</h2>
                {/if}
                <OutputComponent bind:routine={originalCode} />
            </Column>
            <Column>
                {#if routine}
                <h2 style="padding-bottom: 1.5rem;">Output</h2>
                {/if}
                <OutputComponent bind:routine />
            </Column>
        </Row>
    </Grid>
</main>

<style>
</style>
