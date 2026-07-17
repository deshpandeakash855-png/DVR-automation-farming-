import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "your api key",
  authDomain: "roof-top-farming.firebaseapp.com",
  databaseURL: "your url",
  projectId: "roof-top-farming",
  storageBucket: "roof-top-farming.firebasestorage.app",
  messagingSenderId: "191830721041",
  appId: "1:191830721041:web:7a184be21865e3b3a627b0",
  measurementId: "G-FLW0YNGTT8",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Multi-node field topology — 1-acre field divided into irrigation zones.
// Each node in Firebase: /farm/nodes/<id>/{ name, moisture, temperature, humidity, pump, camera_frame }
export const NODE_BASE_PATH = "/farm/nodes";

export const FIELD_NODES = [
  { id: "node_01", name: "Zone 1 — North Field" },
  { id: "node_02", name: "Zone 2 — East Field" },
  { id: "node_03", name: "Zone 3 — South Field" },
  { id: "node_04", name: "Zone 4 — West Field" },
  { id: "node_05", name: "Zone 5 — Center Field" },
];

export function nodePath(nodeId, field) {
  return field ? `${NODE_BASE_PATH}/${nodeId}/${field}` : `${NODE_BASE_PATH}/${nodeId}`;
}

// Listen to the entire /farm/nodes tree.
// Callback receives { [nodeId]: { name, moisture, temperature, humidity, pump, camera_frame } }
export function listenToNodes(callback) {
  const r = ref(db, NODE_BASE_PATH);
  return onValue(r, (snapshot) => {
    callback(snapshot.val() || {});
  });
}

// Control a specific node's pump — ESP32 reads "ON"/"OFF" strings
export function setNodePumpRelay(nodeId, value) {
  return set(ref(db, nodePath(nodeId, "pump")), value ? "ON" : "OFF");
}
