// External converter for ESPHome CO2 sensor (ESP32-C6 + SCD41)
// Place this file in your Z2M config folder: /config/zigbee2mqtt/external_converters/co2-lada.mjs
// Then restart Zigbee2MQTT (or load via Settings > Dev Console > External Converters)

import { temperature, humidity } from 'zigbee-herdsman-converters/lib/modernExtend';
import * as exposes from 'zigbee-herdsman-converters/lib/exposes';
import * as reporting from 'zigbee-herdsman-converters/lib/reporting';

const e = exposes.presets;

// Custom fromZigbee converter for CO2 via the analogInput cluster (endpoint 2)
// The device reports CO2 as a SINGLE (float) in attribute 0x0055 (present-value)
const fzCO2 = {
    cluster: 'genAnalogInput',
    type: ['attributeReport', 'readResponse'],
    convert: (model, msg, publish, options, meta) => {
        if (msg.endpoint.ID === 2 && msg.data.hasOwnProperty('presentValue')) {
            return { co2: Math.round(msg.data['presentValue']) };
        }
    },
};

const definition = {
    // Match your device exactly — these must reflect what the device advertises over Zigbee.
    // After pairing, check the Z2M frontend > device > About tab for the real zigbeeModel string.
    zigbeeModel: ['ESPHome CO2 Sensor'],
    model: 'co2-lada',
    vendor: 'Custom-DIY',
    description: 'ESPHome CO2 sensor (ESP32-C6 + SCD41) — temperature, humidity, CO2',

    // Temperature and humidity on endpoint 1 — handled by modernExtend
    extend: [
        temperature({ endpointNames: ['1'] }),
        humidity({ endpointNames: ['1'] }),
    ],

    // CO2 via custom converter on endpoint 2 (analogInput cluster)
    fromZigbee: [fzCO2],
    toZigbee: [],

    exposes: [
        e.co2(),  // Exposes as proper CO2 (ppm) entity in HA
    ],

    endpoint: (device) => ({
        '1': 1,
        '2': 2,
    }),

    meta: { multiEndpoint: true },

    // Configure reporting for CO2 attribute on endpoint 2
    configure: async (device, coordinatorEndpoint) => {
        const ep2 = device.getEndpoint(2);
        await reporting.bind(ep2, coordinatorEndpoint, ['genAnalogInput']);
        await ep2.configureReporting('genAnalogInput', [
            {
                attribute: 'presentValue',
                minimumReportInterval: 60,    // at most once per minute
                maximumReportInterval: 300,   // at least once per 5 minutes
                reportableChange: 10,         // or when CO2 changes by 10 ppm
            },
        ]);
    },
};

export default definition;
