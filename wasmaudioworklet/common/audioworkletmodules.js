export function getAudioWorkletModuleUrl(audioWorkletModuleFunction) {
    const functionSource = audioWorkletModuleFunction.toString();
    const functionSourceUnwrapped = functionSource.substring(functionSource.indexOf('{') + 1, functionSource.lastIndexOf('}'));
    return URL.createObjectURL(new Blob([functionSourceUnwrapped], { type: 'text/javascript' }));
}
