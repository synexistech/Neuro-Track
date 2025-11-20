export const recognizeGesture = (landmarks: any[]) => {
    if (!landmarks || landmarks.length === 0) return "UNKNOWN";

    // Finger tips and bases
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];

    // Check if fingers are extended (Tip is higher than PIP - note Y is inverted in screen coords usually, but let's check distance from wrist)
    // Actually, simpler check: is Tip "above" PIP? (Y value is smaller)
    // Note: This simple logic assumes hand is upright. For more robust, we need vector math.
    // Let's use a simple "distance from wrist" check.
    const wrist = landmarks[0];

    const isExtended = (tip: any, pip: any) => {
        // Simple check: distance from wrist to tip > distance from wrist to pip
        const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
        const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
        return distTip > distPip;
    };

    const thumbOpen = isExtended(thumbTip, thumbIP);
    const indexOpen = isExtended(indexTip, indexPIP);
    const middleOpen = isExtended(middleTip, middlePIP);
    const ringOpen = isExtended(ringTip, ringPIP);
    const pinkyOpen = isExtended(pinkyTip, pinkyPIP);

    if (thumbOpen && indexOpen && middleOpen && ringOpen && pinkyOpen) return "OPEN PALM";
    if (!thumbOpen && !indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return "FIST";
    if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen) return "POINTING";
    if (indexOpen && middleOpen && !ringOpen && !pinkyOpen) return "PEACE";
    if (thumbOpen && !indexOpen && !middleOpen && !ringOpen && pinkyOpen) return "SHAKA";

    return "UNKNOWN";
};
