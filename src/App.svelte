<script lang="ts">
    import Upload from "./lib/Upload.svelte";
    import { parseGcode, multiply, addCnstomGcode } from "./lib/engine";

    function onFileLoad(gcodeStr: any) {
        // let gcode = gcodeStr;
        let gcode = parseGcode(gcodeStr);
        console.log(gcode);
        console.log(gcode.toString());

        let multiplied = multiply(gcode, 4, 3, 30, 25);
        let finsihed = addCnstomGcode(gcode, "", "");
        console.log(finsihed.toString());
    }
</script>

<main>
    <Upload onload={onFileLoad} />
</main>

<style>
</style>
