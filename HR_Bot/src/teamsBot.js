const axios = require("axios");
const { ActivityTypes } = require("@microsoft/agents-activity");
const {
  AgentApplication,
  AttachmentDownloader,
  MemoryStorage,
} = require("@microsoft/agents-hosting");
const { version } = require("@microsoft/agents-hosting/package.json");
const { exec } = require('child_process');

const downloader = new AttachmentDownloader();

// Define storage and application
const storage = new MemoryStorage();
const teamsBot = new AgentApplication({
  storage,
  fileDownloaders: [downloader],
});

// Listen for user to say '/reset' and then delete conversation state
teamsBot.message("/reset", async (context, state) => {
  state.deleteConversationState();
  await context.sendActivity("Ok I've deleted the current conversation state.");
});

teamsBot.message("/count", async (context, state) => {
  const count = state.conversation.count ?? 0;
  await context.sendActivity(`The count is ${count}`);
});

teamsBot.message("/diag", async (context, state) => {
  await state.load(context, storage);
  await context.sendActivity(JSON.stringify(context.activity));
});

teamsBot.message("/state", async (context, state) => {
  await state.load(context, storage);
  await context.sendActivity(JSON.stringify(state));
});

teamsBot.message("/runtime", async (context, state) => {
  const runtime = {
    nodeversion: process.version,
    sdkversion: version,
  };
  await context.sendActivity(JSON.stringify(runtime));
});

teamsBot.message("/upload", async (context, state) => {
  console.log("Processing PDF upload...");

  try {
    const attachments = context.activity.attachments;

    if (!attachments || attachments.length === 0) {
      await context.sendActivity("Please upload a PDF file with the /upload command.");
      return;
    }

    const attachment = attachments[0];
    console.log("Attachment received:", attachment);

    if (attachment.contentType !== "application/pdf") {
      await context.sendActivity("Only PDF files are supported. Please upload a valid PDF file.");
      return;
    }

    const pdfUrl = attachment.contentUrl;
    console.log("PDF URL:", pdfUrl);

    const nifiEndpoint = "http://172.200.58.63:8083/upload"; // Replace with the correct NiFi endpoint
    const nifiPayload = { pdf_url: pdfUrl };
    const nifiResponse = await axios.post(nifiEndpoint, nifiPayload, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    console.log("Response received from NiFi pipeline.", nifiResponse.data);
    await context.sendActivity({
      text: "PDF URL sent to NiFi pipeline successfully.",
    });

  } catch (error) {
    console.error("Error processing PDF upload:", error.message);
    await context.sendActivity("Sorry, I couldn't process the uploaded PDF. Please try again later.");
  }
});

// --- New Feature: /makeresume ---
teamsBot.message("/makeresume", async (context, state) => {
  const text = context.activity.text || "";
  const args = text.replace(/^\/makeresume\s*/i, "").trim();

  let identifier_type;
  let identifier;
  let job_description;

  const idMatch = args.match(/^(name|employee_id)\s+([^\s][^\n\r]*?)(?=\s+jd\b|$)/i);
  if (idMatch) {
    identifier_type = idMatch[1].toLowerCase();
    identifier = idMatch[2].trim();
  }

  const jdMatch = args.match(/jd\s+"([^"]+)"|jd\s+(.+)/i);
  if (jdMatch) {
    job_description = (jdMatch[1] || jdMatch[2]).trim();
  }

  const payload = {};
  if (identifier_type && identifier) {
    payload.identifier_type = identifier_type;
    payload.identifier = identifier;
  }
  if (job_description) {
    payload.job_description = job_description;
  }

  if (!payload.identifier_type && !payload.job_description) {
    await context.sendActivity("Please provide at least an identifier (name/employee_id) or a job description after jd.\nExample: /makeresume name Kushagra Wadhwa jd \"Job description\" or /makeresume jd \"Job description only\"");
    return;
  }

  try {
    const response = await axios.post("http://104.208.162.61:8083/makeresume", payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000
    });

    const jsonResume = response.data;
    exec(`python3 path/to/your/python_script.py '${JSON.stringify(jsonResume)}'`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        await context.sendActivity("Failed to generate the resume document.");
        return;
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        await context.sendActivity("Failed to generate the resume document.");
        return;
      }

      const filePath = 'path/to/generated/resume.docx';
      await context.sendActivity({
        text: "Here is your resume:",
        attachments: [{
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          contentUrl: filePath,
          name: "resume.docx"
        }]
      });
    });
  } catch (err) {
    await context.sendActivity(`Failed to call resume API: ${err.response?.data || err.message}`);
  }
});

teamsBot.conversationUpdate("membersAdded", async (context, state) => {
  await context.sendActivity(
    `Hi there! I'm an echo bot running on Agents SDK version ${version} that will echo what you said to me.`
  );
});

// Listen for ANY message to be received. MUST BE AFTER ANY OTHER MESSAGE HANDLERS
teamsBot.activity(ActivityTypes.Message, async (context, state) => {
  console.log("Processing PDF upload...");

  try {
    const attachments = context.activity.attachments;

    if (!attachments || attachments.length === 0) {
      await context.sendActivity("Please upload a PDF file with the /upload command.");
      return;
    }

    const attachment = attachments[0];
    console.log("Attachment received");

    if (attachment.contentType !== "application/pdf") {
      await context.sendActivity("Only PDF files are supported. Please upload a valid PDF file.");
      return;
    }

    const pdfUrl = attachment.contentUrl;
    console.log("PDF URL:", pdfUrl);

    const nifiEndpoint = ""; // Replace with the correct NiFi endpoint
    const nifiPayload = { pdf_url: pdfUrl };
    const nifiResponse = await axios.post(nifiEndpoint, nifiPayload, {
      headers: {
        "Content-Type": "application/json",
      }
    });
    console.log("Response received from NiFi pipeline.", nifiResponse.data);
    await context.sendActivity({
      text: "PDF URL sent to NiFi pipeline successfully.",
    });

  } catch (error) {
    console.error("Error processing PDF upload:", error.message);
    await context.sendActivity("Sorry, I couldn't process the uploaded PDF. Please try again later.");
  }
});

teamsBot.activity(/^message/, async (context, state) => {
  await context.sendActivity(`Matched with regex: ${context.activity.type}`);
});

teamsBot.activity(
  async (context) => Promise.resolve(context.activity.type === "message"),
  async (context, state) => {
    await context.sendActivity(`Matched function: ${context.activity.type}`);
  }
);

module.exports.teamsBot = teamsBot;