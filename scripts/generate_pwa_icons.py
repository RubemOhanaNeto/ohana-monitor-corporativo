import zlib
import struct
import math

def create_png(width, height, is_maskable=False):
    def get_pixel(x, y):
        # Normalize coords from -1 to 1
        nx = (x / (width - 1)) * 2 - 1
        ny = (y / (height - 1)) * 2 - 1
        
        # Safe scale for maskable (pad by ~15%)
        scale = 1.3 if is_maskable else 1.0
        px = nx * scale
        py = ny * scale
        
        # Background: Dark navy blue
        bg_r, bg_g, bg_b = 15, 23, 42
        
        # Check shield shape
        # Shield upper boundary: py > -0.6
        # Top peak in center: py > -0.7 + 0.1 * abs(px)
        # Sides: abs(px) < 0.65
        # Bottom curve: py < 0.7 - 0.7 * (abs(px)/0.65)**1.5
        in_shield = False
        if abs(px) <= 0.60 and py >= -0.7 + 0.15 * abs(px):
            bottom_limit = 0.72 - 0.75 * (abs(px) / 0.60)**1.8
            if py <= bottom_limit:
                in_shield = True
        
        if in_shield:
            # Shield border vs inner
            inner = False
            if abs(px) <= 0.52 and py >= -0.60 + 0.15 * abs(px):
                bottom_limit_inner = 0.60 - 0.70 * (abs(px) / 0.52)**1.8
                if py <= bottom_limit_inner:
                    inner = True
            
            if not inner:
                # Border: bright royal blue
                return 59, 130, 246, 255
            else:
                # Inside shield: dark slate with pulse
                # Check ECG pulse line
                # Pulse line runs from px = -0.45 to 0.45 at py around 0.05
                # spikes at px=-0.15 (down -0.2), px=0.0 (up 0.3), px=0.15 (down -0.15)
                ecg_y = 0.05
                if -0.25 <= px <= -0.10:
                    t = (px - (-0.25)) / 0.15
                    ecg_y = 0.05 - 0.25 * math.sin(t * math.pi)
                elif -0.10 <= px <= 0.10:
                    t = (px - (-0.10)) / 0.20
                    ecg_y = 0.05 + 0.35 * math.sin(t * math.pi)
                elif 0.10 <= px <= 0.25:
                    t = (px - 0.10) / 0.15
                    ecg_y = 0.05 - 0.20 * math.sin(t * math.pi)
                
                dist_ecg = abs(py - ecg_y)
                if abs(px) <= 0.40 and dist_ecg < 0.045:
                    # Neon cyan pulse
                    return 56, 189, 248, 255
                
                # Check center top circle node
                dist_node = math.hypot(px, py - (-0.30))
                if dist_node < 0.06:
                    if dist_node < 0.025:
                        return 255, 255, 255, 255
                    return 96, 165, 250, 255

                # Inside fill: deep dark slate gradient
                grad = (py + 0.7) / 1.4
                r = int(15 + 10 * grad)
                g = int(23 + 15 * grad)
                b = int(42 + 25 * grad)
                return r, g, b, 255
                
        # Outer background
        if is_maskable:
            return bg_r, bg_g, bg_b, 255
        else:
            # Rounded rect for any icons
            corner_r = 0.28
            dx = max(0, abs(nx) - (1.0 - corner_r))
            dy = max(0, abs(ny) - (1.0 - corner_r))
            if math.hypot(dx, dy) > corner_r:
                return 0, 0, 0, 0 # Transparent outside rounded corner
            return bg_r, bg_g, bg_b, 255

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel(x, y)
            raw_data.extend([r, g, b, a])

    def png_chunk(chunk_type, data):
        length = struct.pack('>I', len(data))
        crc = struct.pack('>I', zlib.crc32(chunk_type + data) & 0xffffffff)
        return length + chunk_type + data + crc

    png_header = b'\x89PNG\r\n\x1a\n'
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    idat = zlib.compress(raw_data, 9)
    
    return (png_header +
            png_chunk(b'IHDR', ihdr) +
            png_chunk(b'IDAT', idat) +
            png_chunk(b'IEND', b''))

with open('/app/applet/public/pwa-192x192.png', 'wb') as f:
    f.write(create_png(192, 192, False))

with open('/app/applet/public/pwa-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, False))

with open('/app/applet/public/apple-touch-icon.png', 'wb') as f:
    f.write(create_png(180, 180, False))

with open('/app/applet/public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, True))

print('Icons generated successfully!')
