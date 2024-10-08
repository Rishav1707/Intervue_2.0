require("dotenv").config();
import express from "express";
import fs from "fs";
import yaml from "yaml";
import path from "path";
import cors from "cors";
import {
  KubeConfig,
  AppsV1Api,
  CoreV1Api,
  NetworkingV1Api,
} from "@kubernetes/client-node";

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 3002;

const kubeconfig = new KubeConfig();
kubeconfig.loadFromString(process.env.CLUSTER_KEY as string);
const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

// Updated utility function to handle multi-document YAML files
const readAndParseKubeYaml = (filePath: string, replId: string): Array<any> => {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const docs = yaml.parseAllDocuments(fileContent).map((doc) => {
    let docString = doc.toString();
    const regex = new RegExp(`service_name`, "g");
    docString = docString.replace(regex, replId);
    console.log(docString);
    return yaml.parse(docString);
  });
  return docs;
};

app.post("/start", async (req, res) => {
  const { replId } = req.body; // Assume a unique identifier for each user
  const namespace = "default"; // Assuming a default namespace, adjust as needed

  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "../service.yaml"),
      replId
    );
    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case "Deployment":
          await appsV1Api.createNamespacedDeployment(namespace, manifest);
          break;
        case "Service":
          await coreV1Api.createNamespacedService(namespace, manifest);
          break;
        case "Ingress":
          await networkingV1Api.createNamespacedIngress(namespace, manifest);
          break;
        default:
          console.log(`Unsupported kind: ${manifest.kind}`);
      }
    }
    res.status(200).send({ message: "Resources created successfully" });
  } catch (error) {
    console.error("Failed to create resources", error);
    res.status(500).send({ message: "Failed to create resources" });
  }
});

app.post("/stop", async (req, res) => {
  const { replId } = req.body;
  const namespace = "default";
  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "../service.yaml"),
      replId
    );
    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case "Deployment":
          await appsV1Api.deleteNamespacedDeployment(
            manifest.metadata.name,
            namespace
          );
          break;
        case "Service":
          await coreV1Api.deleteNamespacedService(
            manifest.metadata.name,
            namespace
          );
          break;
        case "Ingress":
          const { body: existingIngress } =
            await networkingV1Api.readNamespacedIngress(
              manifest.metadata.name,
              namespace
            );

          // Extract the secret name from the Ingress resource
          const tlsSecrets =
            existingIngress?.spec?.tls?.map((tls) => tls.secretName) || [];

          for (const secretName of tlsSecrets) {
            if (secretName) {
              // Delete the TLS secret
              await coreV1Api.deleteNamespacedSecret(secretName, namespace);
              console.log(`Deleted secret ${secretName}`);
            }
          }
          await networkingV1Api.deleteNamespacedIngress(
            manifest.metadata.name,
            namespace
          );
          break;
        default:
          console.log(`Unsupported kind: ${manifest.kind}`);
      }
    }
    res.status(200).send({ message: "Resources deleted successfully" });
  } catch (error) {
    console.error("Failed to delete resources", error);
    res.status(500).send({ message: "Failed to delete resources" });
  }
});

app.post("/startWorker", async (req, res) => {
  const namespace = "default";
  try {
    const kubeManifests = readAndParseKubeYaml(
      path.join(__dirname, "../worker.yaml"),
      ""
    );
    for (const manifest of kubeManifests) {
      switch (manifest.kind) {
        case "Deployment":
          await appsV1Api.createNamespacedDeployment(namespace, manifest);
          break;
        default:
          console.log(`Unsupported kind: ${manifest.kind}`);
      }
    }
    res.status(200).send({ message: "Created Worker" });
  } catch (error) {
    console.error("Failed to create worker", error);
    res.status(500).send({ message: "Failed to create worker" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
