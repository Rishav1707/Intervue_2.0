import { Socket } from "socket.io-client";
import { Editor } from "@monaco-editor/react";
import { File } from "@repo/types";
import { editor as monacoEditor } from "monaco-editor";
const Code = ({
  socket,
  selectedFile,
}: {
  socket: Socket | null;
  selectedFile: File | undefined;
}) => {
  const code = selectedFile?.content;
  let language = selectedFile?.name.split(".").pop();
  if (language == "js" || language == "jsx") {
    language = "javascript";
  } else if (language == "ts" || language == "tsx") {
    language = "typescript";
  } else if (language == "py") {
    language = "python";
  }
  function debounce(func: (value: string) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(value);
      }, wait);
    };
  }
  const handleChange = (
    value: string | undefined,
    event: monacoEditor.IModelContentChangedEvent
  ) => {
    console.log("value", value);
    console.log("event", event);
    console.log("selectedFile", selectedFile?.path);

    if (value !== undefined) {
      debounce((value) => {
        socket?.emit("updateContent", {
          path: selectedFile?.path,
          content: value,
        });
      }, 500)(value);
    }
  };

  return (
    <>
      <Editor
        width="45.5vw"
        height="95vh"
        language={language}
        theme="vs-dark"
        loading={"Loading..."}
        value={code}
        onChange={handleChange}
        className="py-1"
      />
    </>
  );
};

export default Code;
