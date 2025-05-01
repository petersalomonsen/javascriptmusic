cmake_minimum_required(VERSION 3.15)

project(WebAssemblyMusicSynth VERSION 0.0.1)

add_subdirectory(JUCE)

juce_add_plugin(WebAssemblyMusicSynth
    COMPANY_NAME "WebAssembly Music"
    IS_SYNTH TRUE
    NEEDS_MIDI_INPUT TRUE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    COPY_PLUGIN_AFTER_BUILD TRUE
    PLUGIN_MANUFACTURER_CODE WaMu
    PLUGIN_CODE Wasm
    FORMATS AU)

target_sources(WebAssemblyMusicSynth
    PRIVATE
        WebAssemblyMusicSynth.cpp)

target_compile_definitions(WebAssemblyMusicSynth
    PRIVATE
        JUCE_VST3_CAN_REPLACE_VST2=0)

target_include_directories(WebAssemblyMusicSynth
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/wasmedge/build/include/api
)

target_link_libraries(WebAssemblyMusicSynth
    PRIVATE
        juce::juce_audio_utils
        ${CMAKE_CURRENT_SOURCE_DIR}/wasmedge/build/_deps/fmt-build/libfmt.a
        ${CMAKE_CURRENT_SOURCE_DIR}/wasmedge/build/lib/api/libwasmedge.a
        z
        ncurses
        pthread # For -pthread, commonly needed for threading support
        m # For -lm, math library
        xar
    PUBLIC
        juce::juce_audio_plugin_client
        juce::juce_dsp
)

if(UNIX AND NOT APPLE)
    target_link_libraries(WebAssemblyMusicSynth
        PRIVATE
            rt # For -lrt, time-related functions, not needed on macOS.
            dl # For -ldl, dynamic loading of shared libraries
    )
endif()

juce_generate_juce_header(WebAssemblyMusicSynth)
