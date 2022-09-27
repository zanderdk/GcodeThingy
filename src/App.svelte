<script lang="ts">
    import "carbon-components-svelte/css/g90.css";
    import {
        NumberInput,
        Grid,
        Row,
        Column,
        Form,
        Button,
        ButtonSet,
        TextArea,
        FormGroup,
        ContentSwitcher,
        Switch,
        FileUploaderDropContainer,
    } from "carbon-components-svelte";
    import Highlight from "svelte-highlight";
    import gcode from "svelte-highlight/languages/typescript";
    import obsidian from "svelte-highlight/styles/obsidian";
    import Fa from 'svelte-fa';
    import { faDownload, faCopy } from '@fortawesome/free-solid-svg-icons';
    import InputComponent from './lib/InputComponent.svelte';


    const code = `%
O0405
(DATEO09/18/22 TIMEO14O49O15)
G54G90G80G17G40G94
G52X0Y0Z0

#102=5(#-OF-PARTS-IN-X)
#105=80(PITCH-IN-X)

#1=0
#2=0
T11M6
S1000M3
M8

N2000
#1=[#1+1]
G52X#2

G0X10Y0
G43H11Z2
G1Z-10
X10
G0Z2

#2=[#2+#105]
IF[#1EQ#102]GOTO2010
GOTO2000

N2010
#1=0
#2=0
T12M6
S800M3
M8

N2020
#1=[#1+1]
G52X#2

G0X10Y0
G43H11Z2
G1Z-10
Y-10
G0Z2

#2=[#2+#105]
IF[#1EQ#102]GOTO2060
GOTO2020

(FINISH)
N2060
M9
M5
G52X0Y0Z0
M30
%`;
</script>

<svelte:head>
    {@html obsidian}
</svelte:head>

<main style="">
    <h2 style="padding-bottom: 1.5rem;">Settings</h2>
    <InputComponent/>
    <h2 style="padding-bottom: 1.5rem;">Output</h2>

    <ButtonSet>
        <Button kind="primary"><Fa icon={faDownload}/> Download</Button>
        <Button kind="primary"><Fa icon={faCopy}/> Copy</Button>
    </ButtonSet>
    <br/>
    <Highlight language={gcode} {code} />
</main>

<style>
</style>
