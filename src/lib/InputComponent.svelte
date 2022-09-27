<script context="module" lang="ts">
    export type FileReadFunctionType = (a: string) => any;
</script>

<script lang="ts">
    import {
        NumberInput,
        Grid,
        Row,
        Column,
        Form,
        TextArea,
        FormGroup,
        ContentSwitcher,
        Switch,
        FileUploaderDropContainer,
    } from "carbon-components-svelte";


    export let onFileChange: FileReadFunctionType;
    export let xPitch: number;
    export let yPitch: number;
    export let xAmount: number;
    export let yAmount: number;
    export let beforeLoopCode: string;
    export let afterLoopCode: string;

    async function GetFileData(file: File): Promise<string> {
        let p: Promise<string> = new Promise((res, _) => {
            const reader = new FileReader();
            reader.onload = async (e: Event) => {
                let fr: FileReader = e.target;
                res(fr.result as string);
            };
            reader.readAsText(file, "UTF-8");
        });
        return p;
    }

    async function fileChange(a: CustomEvent<ReadonlyArray<File>>) {
        //TODO file size check
        let content: string = await GetFileData(a.detail[0]);
        onFileChange(content);
    }
</script>

<Form>
    <FormGroup legendText="Input and Generated output macro language">
        <ContentSwitcher selectedIndex={0}>
            <Switch text="Macro B" />
            <Switch text="Macro A" disabled />
            <Switch text="Heidenhain" disabled />
        </ContentSwitcher>
    </FormGroup>
    <FormGroup legendText="Axis multiplier controls">
        <Grid padding={false} noGutter={true}>
            <Row>
                <Column>
                    <NumberInput
                        bind:value={xAmount}
                        helperText="X axis multiplier"
                    />
                </Column>
                <Column>
                    <NumberInput
                        bind:value={xPitch}
                        helperText="X axis pitch"
                    />
                </Column>
                <Column>
                    <NumberInput
                        bind:value={yAmount}
                        helperText="Y axis multiplier"
                    />
                </Column>
                <Column>
                    <NumberInput
                        bind:value={yPitch}
                        helperText="Y axis pitch"
                    />
                </Column>
            </Row>
        </Grid>
    </FormGroup>
    <FormGroup legendText="Custom Gcodes">
        <Grid padding={false} noGutter={true}>
            <Row>
                <Column>
                    <TextArea
                        helperText="Runs before every loop"
                        placeholder="Some Gcode here"
                        bind:value={beforeLoopCode}
                    />
                </Column>
                <Column>
                    <TextArea
                        helperText="Runs after every loop"
                        placeholder="Some Gcode here"
                        bind:value={afterLoopCode}
                    />
                </Column>
            </Row>
        </Grid>
    </FormGroup>
    <FormGroup legendText="Gcode file to repeat">
        <FileUploaderDropContainer
            on:change={fileChange}
            labelText="Drag and drop Gcode files here or click to upload: *.gcode, *.nc, *.mpt, *.mpf"
        />
    </FormGroup>
</Form>
