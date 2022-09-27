<script lang="ts">
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
        console.log(content);
    }
</script>

<Form>
    <FormGroup legendText="Input and Generated output macro language">
        <ContentSwitcher selectedIndex={0}>
            <Switch text="Macro B" />
            <Switch text="Macro A" />
            <Switch text="Heidenhain (not implemented yet)" disabled />
        </ContentSwitcher>
    </FormGroup>
    <FormGroup legendText="Axis multiplier controls">
        <Grid padding={false} noGutter={true}>
            <Row>
                <Column>
                    <NumberInput value={1} helperText="X axis multiplier" />
                </Column>
                <Column>
                    <NumberInput value={25} helperText="X axis pitch" />
                </Column>
                <Column>
                    <NumberInput value={1} helperText="Y axis multiplier" />
                </Column>
                <Column>
                    <NumberInput value={25} helperText="Y axis pitch" />
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
                    />
                </Column>
                <Column>
                    <TextArea
                        helperText="Runs after every loop"
                        placeholder="Some Gcode here"
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
