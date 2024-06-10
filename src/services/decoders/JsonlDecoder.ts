import Decoder from "./Decoder";


class JsonlDecoder implements Decoder {
    decode (): boolean {
        console.log(this);

        return true;
    }
}

export default JsonlDecoder;
