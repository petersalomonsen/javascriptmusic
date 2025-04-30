#include <JuceHeader.h>
#include <wasmedge/wasmedge.h>

class WasmEdgeSynth; // Forward declare

class WasmEdgeSynthEditor : public juce::AudioProcessorEditor,
                            private juce::ComboBox::Listener
{
public:
    explicit WasmEdgeSynthEditor(WasmEdgeSynth &p);
    void resized() override;

private:
    void comboBoxChanged(juce::ComboBox *comboBoxThatHasChanged) override;

    WasmEdgeSynth &processor;
    juce::ComboBox instrumentSelector;
};
class WasmEdgeSynth final : public AudioProcessor
{
public:
    WasmEdgeSynth()
        : AudioProcessor(BusesProperties().withOutput("Output", AudioChannelSet::stereo()))
    {
        WasmEdge_ConfigureContext *ConfCxt = WasmEdge_ConfigureCreate();

        printf("Creating WasmEdge compiler context\n");
        WasmEdge_CompilerContext *CompilerCxt = WasmEdge_CompilerCreate(ConfCxt);
        WasmEdge_CompilerCompile(CompilerCxt, "/Users/peter/song.wasm", "/Users/peter/song.wasm.so");

        WasmEdge_CompilerDelete(CompilerCxt);
        WasmEdge_ConfigureDelete(ConfCxt);

        vm_cxt = WasmEdge_VMCreate(NULL, NULL);
        WasmEdge_Result result = WasmEdge_VMLoadWasmFromFile(vm_cxt, "/Users/peter/song.wasm.so");

        printf("Loaded Wasm file, result: %d\n", result.Code);
    }

    static String getIdentifier()
    {
        return "WasmEdge Synth";
    }

    void prepareToPlay(double newSampleRate, int) override
    {
        synth.setCurrentPlaybackSampleRate(newSampleRate);
        printf("Samplerate is %f\n", newSampleRate);

        if (environmentModuleInstanceContext != NULL) {
            WasmEdge_ModuleInstanceDelete(environmentModuleInstanceContext);
        }
        environmentModuleInstanceContext = WasmEdge_ModuleInstanceCreate(WasmEdge_StringCreateByCString("environment"));
        WasmEdge_VMRegisterModuleFromImport(vm_cxt, environmentModuleInstanceContext);
       
        WasmEdge_GlobalTypeContext *SAMPLERATE_type = WasmEdge_GlobalTypeCreate(WasmEdge_ValType_F32, WasmEdge_Mutability_Const);
        WasmEdge_GlobalInstanceContext *SAMPLERATE_global = WasmEdge_GlobalInstanceCreate(SAMPLERATE_type, WasmEdge_ValueGenF32(newSampleRate));
        WasmEdge_ModuleInstanceAddGlobal(environmentModuleInstanceContext, WasmEdge_StringCreateByCString("SAMPLERATE"), SAMPLERATE_global);

        WasmEdge_VMValidate(vm_cxt);
        printf("Wasm module validatedf\n");
        WasmEdge_VMInstantiate(vm_cxt);

        printf("Wasm module instantiated\n");

        const WasmEdge_ModuleInstanceContext *moduleCtx = WasmEdge_VMGetActiveModule(vm_cxt);
        WasmEdge_GlobalInstanceContext *globCtx = WasmEdge_ModuleInstanceFindGlobal(moduleCtx, WasmEdge_StringCreateByCString("samplebuffer"));
        WasmEdge_MemoryInstanceContext *memCtx = WasmEdge_ModuleInstanceFindMemory(moduleCtx, WasmEdge_StringCreateByCString("memory"));

        fillSampleBufferFuncNameString = WasmEdge_StringCreateByCString("fillSampleBufferWithNumSamples");
        WasmEdge_Value globValue = WasmEdge_GlobalInstanceGetValue(globCtx);
        uint32_t sampleBufferAddrValue = WasmEdge_ValueGetI32(globValue);

        const uint8_t *renderbytebuf = WasmEdge_MemoryInstanceGetPointer(memCtx, sampleBufferAddrValue, 128 * 2 * 4);
        renderbuf = (float32_t *)renderbytebuf;
        printf("Wasm module exports stored\n");

        printf("Prepare completed\n");
    }

    void selectInstrument(int instrumentId)
    {
        selectedInstrumentId = instrumentId;
        printf("Selected instrument ID: %d\n", instrumentId);
    }

    void releaseResources() override
    {
    }

    void processBlock(AudioBuffer<float> &buffer, MidiBuffer &midiMessages) override
    {
        for (const auto metadata : midiMessages)
        {
            MidiMessage message = metadata.getMessage();
            const uint8 *rawmessage = message.getRawData();

            // Copy the message so we can modify the channel
            uint8_t msg0 = (rawmessage[0] & 0xF0) | ((selectedInstrumentId - 1) & 0x0F);

            WasmEdge_Value args[3];
            args[0] = WasmEdge_ValueGenI32(msg0);
            args[1] = WasmEdge_ValueGenI32((uint8_t)rawmessage[1]);
            args[2] = WasmEdge_ValueGenI32((uint8_t)rawmessage[2]);
            WasmEdge_VMExecute(vm_cxt, WasmEdge_StringCreateByCString("shortmessage"), args, 3, NULL, 0);

            printf("sent midi to wasm synth: %d, %d, %d (channel %d)\n", msg0, rawmessage[1], rawmessage[2], (selectedInstrumentId - 1));
        }

        int numSamples = buffer.getNumSamples();
        auto *left = buffer.getWritePointer(0);
        auto *right = buffer.getWritePointer(1);

        for (int sampleNo = 0; sampleNo < numSamples; sampleNo += 128)
        {
            int numSamplesToRender = std::min(numSamples - sampleNo, 128);

            WasmEdge_Value args[1] = {WasmEdge_ValueGenI32((uint32_t)numSamplesToRender)};
            WasmEdge_Result result = WasmEdge_VMExecute(vm_cxt, fillSampleBufferFuncNameString, args, 1, NULL, 0);

            for (int ndx = 0; ndx < numSamplesToRender; ndx++)
            {
                left[sampleNo + ndx] = renderbuf[ndx] * 0.3;
                right[sampleNo + ndx] = renderbuf[ndx + 128] * 0.3;
            }
        }
    }

    using AudioProcessor::processBlock;

    const String getName() const override { return getIdentifier(); }
    double getTailLengthSeconds() const override { return 0.0; }
    bool acceptsMidi() const override { return true; }
    bool producesMidi() const override { return true; }
    AudioProcessorEditor *createEditor() override
    {
        return new WasmEdgeSynthEditor(*this);
    }

    bool hasEditor() const override
    {
        return true;
    }
    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const String getProgramName(int) override { return {}; }
    void changeProgramName(int, const String &) override {}
    void getStateInformation(juce::MemoryBlock &) override {}
    void setStateInformation(const void *, int) override {}

private:
    int selectedInstrumentId = 1; // Default to 1 (Piano)
    WasmEdge_VMContext *vm_cxt;
    WasmEdge_ModuleInstanceContext *environmentModuleInstanceContext;
    WasmEdge_String fillSampleBufferFuncNameString;
    float32_t *renderbuf;
    Synthesiser synth;
    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(WasmEdgeSynth)
};

WasmEdgeSynthEditor::WasmEdgeSynthEditor(WasmEdgeSynth &p)
    : juce::AudioProcessorEditor(p), processor(p)
{
    setSize(400, 200);
    instrumentSelector.addItem("Piano", 1);
    instrumentSelector.addItem("Guitar", 2);
    instrumentSelector.addItem("Drums", 3);
    instrumentSelector.setSelectedId(1);
    instrumentSelector.addListener(this);
    addAndMakeVisible(instrumentSelector);
}

void WasmEdgeSynthEditor::resized()
{
    instrumentSelector.setBounds(10, 10, getWidth() - 20, 30);
}

void WasmEdgeSynthEditor::comboBoxChanged(juce::ComboBox *comboBoxThatHasChanged)
{
    if (comboBoxThatHasChanged == &instrumentSelector)
        processor.selectInstrument(instrumentSelector.getSelectedId());
}

juce::AudioProcessor *JUCE_CALLTYPE createPluginFilter()
{
    return new WasmEdgeSynth();
}