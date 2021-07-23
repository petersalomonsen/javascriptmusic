const urlMap = {};

export function getAudioWorkletModuleUrl(audioWorkletModuleFunction) {
    if (!urlMap[audioWorkletModuleFunction.name]) {
        const functionSource = audioWorkletModuleFunction.toString();
        const functionSourceUnwrapped = functionSource.substring(functionSource.indexOf('{') + 1, functionSource.lastIndexOf('}'));
        urlMap[audioWorkletModuleFunction.name] = URL.createObjectURL(new Blob([functionSourceUnwrapped], { type: 'text/javascript' }));
    }
    return urlMap[audioWorkletModuleFunction.name];
}
