<script lang="ts">
    import Upload from "./lib/Upload.svelte";
    import { parseGcode, splitBlocks } from "./lib/engine";

    function onFileLoad(gcodeStr: any) {
        // let gcode = gcodeStr;
        let gcode = parseGcode(gcodeStr);
        console.log(gcode);

    }
</script>

<main>
    <Upload onload={onFileLoad} />
</main>

<style>
</style>
