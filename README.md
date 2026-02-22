# Z2M ESP32 CO2 Sensor

A Zigbee-enabled CO2 sensor built on the **ESP32-C6** microcontroller and **SCD41** sensor, integrated with **Zigbee2MQTT (Z2M)**.

---

## Overview

This project turns an ESP32-C6 dev board and a Sensirion SCD41 sensor into a fully functional Zigbee CO2 sensor that reports CO2 concentration, temperature, and humidity directly to Zigbee2MQTT — no custom integration needed.

## Features

- 🌿 **CO2 monitoring** via Sensirion SCD41 (photoacoustic NDIR sensor)
- 🌡️ **Temperature & humidity** reporting alongside CO2
- 📡 **Zigbee** connectivity using the ESP32-C6's native 802.15.4 radio
- 🏠 **Zigbee2MQTT compatible** — works out of the box with Home Assistant and other Z2M setups
- 🔌 **Pre-compiled firmware** included — no build toolchain required

---

## Repository Structure

```
Z2M-ESP32-CO2-sennsor/
├── Compiled/               # Pre-compiled firmware binaries ready to flash
├── co2-zigbee-v2.yaml      # ESPHome / device configuration file
├── co2-lada.mjs            # Zigbee2MQTT external converter (device definition)
└── partitions_zb.csv       # Custom partition table for Zigbee firmware
```

---

## Hardware Requirements

| Component | Details |
|-----------|---------|
| Microcontroller | ESP32-C6 (with native 802.15.4 / Zigbee support) |
| CO2 Sensor | Sensirion SCD41 |
| Interface | I²C |
| Power | 3.3V (USB or battery) |

### Wiring (SCD41 → ESP32-C6)

| SCD41 Pin | ESP32-C6 Pin |
|-----------|-------------|
| VDD | 3.3V |
| GND | GND |
| SDA | GPIO6 (or as configured in YAML sda: GPIO22) |
| SCL | GPIO7 (or as configured in YAML scl: GPIO23) |

> Check `co2-zigbee-v2.yaml` for the exact GPIO pin assignments used in this build.

---

## Flashing the Firmware

### Option A: Pre-compiled Binary (Easiest)

1. I use [ESP Web Flasher](https://espressif.github.io/esptool-js/). 
2. Download the binary from the `Compiled/` folder.
3. Flash to your ESP32-C6. Flash to address 0x0 (factory format)

### Option B: Build from Source

1. Install [ESPHome](https://esphome.io/guides/installing_esphome.html). I use ESPhome builder in Home Assistant 
2. Clone or donload files from this repository.
3. The `partitions_zb.csv` file provides a custom flash partition layout required for the Zigbee stack to coexist with the application firmware on the ESP32-C6. Copy it to your ESPHome directory
4. Compile and flas to your ESP32-C6

```bash
esphome run co2-zigbee-v2.yaml
```

---

## Zigbee2MQTT Setup

This sensor uses a custom external converter to expose all measurements correctly.

1. Copy `co2-lada.mjs` to your Zigbee2MQTT `data/` directory (or wherever you store external converters).
2. Add the converter to your `configuration.yaml`:

```yaml
external_converters:
  - co2-lada.mjs
```

3. Restart Zigbee2MQTT.
4. Put the sensor in pairing mode and join it to your Zigbee network.
5. The device will appear with CO2, temperature, and humidity entities.

ESP32-C6 has pretty weak signal when using zigbee. Usualy you need to be close to your coordinator for the device to join your network. 
---

## Home Assistant

Once the device is paired and Z2M is running, entities are automatically discovered via MQTT Discovery in Home Assistant. No additional configuration is needed.

---

## Partition Table

The `partitions_zb.csv` file provides a custom flash partition layout required for the Zigbee stack to coexist with the application firmware on the ESP32-C6.

---

## License

This project is open source. Feel free to use, modify, and share it. 

---

## Credits

Built with:
- [Sensirion SCD41](https://sensirion.com/products/catalog/SCD41/)
- [ESP32-C6](https://www.espressif.com/en/products/socs/esp32-c6)
- [Zigbee2MQTT](https://www.zigbee2mqtt.io/)
- [ESPHome](https://esphome.io/)
