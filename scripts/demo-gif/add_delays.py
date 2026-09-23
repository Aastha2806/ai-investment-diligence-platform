import sys

def parse_and_patch(data, delay_cs):
    out = bytearray()
    assert data[:6] in (b'GIF87a', b'GIF89a')
    out += data[:6]
    i = 6

    # Logical Screen Descriptor (7 bytes)
    lsd = data[i:i+7]
    out += lsd
    packed = lsd[4]
    i += 7

    # Global Color Table
    if packed & 0x80:
        gct_size = 3 * (2 ** ((packed & 0x07) + 1))
        out += data[i:i+gct_size]
        i += gct_size

    frame_count = 0
    while i < len(data):
        marker = data[i]
        if marker == 0x21:  # Extension
            label = data[i+1]
            block = bytearray()
            block.append(data[i])
            block.append(data[i+1])
            j = i + 2
            while True:
                size = data[j]
                block.append(size)
                if size == 0:
                    j += 1
                    break
                block += data[j+1:j+1+size]
                j += 1 + size
            if label == 0xF9:
                # Existing GCE (shouldn't happen here, but pass through untouched)
                pass
            out += block
            i = j
        elif marker == 0x2C:  # Image Descriptor -> insert a GCE right before it
            delay_lo = delay_cs & 0xFF
            delay_hi = (delay_cs >> 8) & 0xFF
            gce = bytes([0x21, 0xF9, 0x04, 0x04, delay_lo, delay_hi, 0x00, 0x00])
            out += gce

            # Copy the Image Descriptor (10 bytes: 0x2C + left2+top2+w2+h2+packed1)
            img_desc = data[i:i+10]
            out += img_desc
            packed_id = img_desc[9]
            j = i + 10

            if packed_id & 0x80:  # Local Color Table
                lct_size = 3 * (2 ** ((packed_id & 0x07) + 1))
                out += data[j:j+lct_size]
                j += lct_size

            # LZW minimum code size (1 byte)
            out.append(data[j])
            j += 1

            # Image data sub-blocks
            while True:
                size = data[j]
                out.append(size)
                if size == 0:
                    j += 1
                    break
                out += data[j+1:j+1+size]
                j += 1 + size

            frame_count += 1
            i = j
        elif marker == 0x3B:  # Trailer
            out.append(marker)
            i += 1
            break
        else:
            raise ValueError(f"Unexpected marker 0x{marker:02x} at offset {i}")

    return bytes(out), frame_count


if __name__ == "__main__":
    in_path, out_path, delay_cs = sys.argv[1], sys.argv[2], int(sys.argv[3])
    with open(in_path, "rb") as f:
        data = f.read()
    patched, frame_count = parse_and_patch(data, delay_cs)
    with open(out_path, "wb") as f:
        f.write(patched)
    print(f"Patched {frame_count} frames, delay={delay_cs}cs, output size={len(patched)} bytes")
