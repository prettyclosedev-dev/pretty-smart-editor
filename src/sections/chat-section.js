import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useAuth0 } from "@auth0/auth0-react";
import { useStopwatch } from "react-timer-hook";
import {
  Button,
  Card,
  Menu,
  MenuItem,
  Position,
  Spinner,
  Text,
  TextArea,
  Divider,
} from "@blueprintjs/core";

import { Popover2 } from "@blueprintjs/popover2";

import { SectionTab } from "polotno/side-panel";
import FaFolder from "@meronex/icons/fa/FaFolder";
import * as api from "../data/graphql/api";

import { ReactComponent as ChatSVG } from "../ui/chatGPT.svg";

/* service */
import { useProject } from "../data/graphql/project";
import systemPrompt from "../utils/chat-system-prompt.txt";

/* graphql */
import { loader } from "graphql.macro";
import { client } from "../data/graphql/client";
import {
  imageDefaults,
  svgDefaults,
  textDefaults,
} from "../utils/json-defaults";
const chatGPT = loader("../data/graphql/queries/chatGPT.graphql");

export const ChatPanel = observer(({ store }) => {
  const {
    isAuthenticated,
    isLoading,
    loginWithPopup,
    getAccessTokenSilently,
    user,
    logout,
  } = useAuth0();
  const [contentHistory, setContentHistory] = useState([]); //{json, prompt}
  const [textContent, setTextContent] = useState("");
  const [promptText, setPromptText] = useState("");
  const [finalTime, setFinalTime] = useState("");

  const project = useProject();

  useEffect(() => {
    if (isAuthenticated) {
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    fetch(systemPrompt)
      .then((response) => response.text())
      .then((textContent) => {
        setPromptText(textContent);
      });
  }, []);

  const handleStringChange = (handler) => {
    return (event) => handler(event.target.value);
  };

  const onInputChange = handleStringChange((textContent) =>
    setTextContent(textContent)
  );

  const { seconds, minutes, hours, days, isRunning, start, pause, reset } =
    useStopwatch({ autoStart: false });

  useEffect(() => {
    const time = `${hours}:${minutes}:${seconds}`;
    setFinalTime(time)
  }, [hours, minutes, seconds]);

  const runChat = async () => {
    // const messages = [
    //   {
    //     role: "system",
    //     content: `
    //   You are a graphics designer using polotno studio editor.

    //   You will be generating the necessary json files to load into polotno editor for the design you create.

    //   The json file needs to be complete with all parameters for polotno studio to work.

    //   Here is a sample json:
    //   ${"```"}
    //   {
    //     "width": 1080,
    //     "height": 1080,
    //     "fonts": [],
    //     "pages": [
    //       {
    //         "id": "wSsN-k1O-I",
    //         "children": [
    //           {
    //             "id": "2VZXjZ36IG",
    //             "type": "svg",
    //             "name": "",
    //             "opacity": 1,
    //             "animations": [],
    //             "visible": true,
    //             "selectable": true,
    //             "removable": true,
    //             "alwaysOnTop": false,
    //             "showInExport": true,
    //             "x": -175.8035785946446,
    //             "y": 358.20873759982214,
    //             "width": 917.4904170873384,
    //             "height": 917.4904170873382,
    //             "rotation": -39.98022689623236,
    //             "blurEnabled": false,
    //             "blurRadius": 10,
    //             "brightnessEnabled": false,
    //             "brightness": 0,
    //             "sepiaEnabled": false,
    //             "grayscaleEnabled": false,
    //             "shadowEnabled": false,
    //             "shadowBlur": 5,
    //             "shadowOffsetX": 0,
    //             "shadowOffsetY": 0,
    //             "shadowColor": "black",
    //             "shadowOpacity": 1,
    //             "draggable": true,
    //             "resizable": true,
    //             "contentEditable": true,
    //             "styleEditable": true,
    //             "src": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MCA2MCI+PHBvbHlnb24gZmlsbD0icmdiKDAsIDE2MSwgMjU1KSIgcG9pbnRzPSIwIDAsIDYwIDYwLCAwIDYwIiAvPjwvc3ZnPg==",
    //             "maskSrc": "",
    //             "cropX": 0,
    //             "cropY": 0,
    //             "cropWidth": 1,
    //             "cropHeight": 1,
    //             "keepRatio": false,
    //             "flipX": false,
    //             "flipY": false,
    //             "borderColor": "black",
    //             "borderSize": 0,
    //             "cornerRadius": 0,
    //             "colorsReplace": { "rgb(0, 161, 255)": "rgba(54,14,136,0.55)" }
    //           },
    //           {
    //             "id": "5vcAwHFcEp",
    //             "type": "text",
    //             "name": "",
    //             "opacity": 1,
    //             "animations": [],
    //             "visible": true,
    //             "selectable": true,
    //             "removable": true,
    //             "alwaysOnTop": false,
    //             "showInExport": true,
    //             "x": 45.20385238035044,
    //             "y": 587.973635935562,
    //             "width": 425.2679709149749,
    //             "height": 80,
    //             "rotation": 0,
    //             "blurEnabled": false,
    //             "blurRadius": 10,
    //             "brightnessEnabled": false,
    //             "brightness": 0,
    //             "sepiaEnabled": false,
    //             "grayscaleEnabled": false,
    //             "shadowEnabled": false,
    //             "shadowBlur": 5,
    //             "shadowOffsetX": 0,
    //             "shadowOffsetY": 0,
    //             "shadowColor": "black",
    //             "shadowOpacity": 1,
    //             "draggable": true,
    //             "resizable": true,
    //             "contentEditable": true,
    //             "styleEditable": true,
    //             "text": "Adventure",
    //             "placeholder": "",
    //             "fontSize": 65.26166180875003,
    //             "fontFamily": "Rock Salt",
    //             "fontStyle": "italic",
    //             "fontWeight": "normal",
    //             "textDecoration": "",
    //             "fill": "rgba(255,255,255,1)",
    //             "align": "center",
    //             "verticalAlign": "top",
    //             "strokeWidth": 0,
    //             "stroke": "black",
    //             "lineHeight": 1.2,
    //             "letterSpacing": 0,
    //             "backgroundEnabled": false,
    //             "backgroundColor": "#7ED321",
    //             "backgroundOpacity": 1,
    //             "backgroundCornerRadius": 0.5,
    //             "backgroundPadding": 0.5
    //           },
    //           {
    //             "id": "tFBvl-yGfd",
    //             "type": "text",
    //             "name": "",
    //             "opacity": 1,
    //             "animations": [],
    //             "visible": true,
    //             "selectable": true,
    //             "removable": true,
    //             "alwaysOnTop": false,
    //             "showInExport": true,
    //             "x": 104.49099013247957,
    //             "y": 540,
    //             "width": 135.51486194745559,
    //             "height": 41,
    //             "rotation": 0,
    //             "blurEnabled": false,
    //             "blurRadius": 10,
    //             "brightnessEnabled": false,
    //             "brightness": 0,
    //             "sepiaEnabled": false,
    //             "grayscaleEnabled": false,
    //             "shadowEnabled": false,
    //             "shadowBlur": 5,
    //             "shadowOffsetX": 0,
    //             "shadowOffsetY": 0,
    //             "shadowColor": "black",
    //             "shadowOpacity": 1,
    //             "draggable": true,
    //             "resizable": true,
    //             "contentEditable": true,
    //             "styleEditable": true,
    //             "text": "Life is an ",
    //             "placeholder": "",
    //             "fontSize": 33.24615417191629,
    //             "fontFamily": "Quattrocento",
    //             "fontStyle": "normal",
    //             "fontWeight": "bold",
    //             "textDecoration": "",
    //             "fill": "rgba(255,255,255,1)",
    //             "align": "left",
    //             "verticalAlign": "top",
    //             "strokeWidth": 0,
    //             "stroke": "black",
    //             "lineHeight": 1.2,
    //             "letterSpacing": 0,
    //             "backgroundEnabled": false,
    //             "backgroundColor": "#7ED321",
    //             "backgroundOpacity": 1,
    //             "backgroundCornerRadius": 0.5,
    //             "backgroundPadding": 0.5
    //           },
    //           {
    //             "id": "fc26vOQB6t",
    //             "type": "image",
    //             "name": "",
    //             "opacity": 1,
    //             "animations": [],
    //             "visible": true,
    //             "selectable": true,
    //             "removable": true,
    //             "alwaysOnTop": false,
    //             "showInExport": true,
    //             "x": -6.52479398748679e-14,
    //             "y": 8.876812109593064e-14,
    //             "width": 1079.9999999999995,
    //             "height": 471.3243243243241,
    //             "rotation": 0,
    //             "blurEnabled": false,
    //             "blurRadius": 10,
    //             "brightnessEnabled": false,
    //             "brightness": 0,
    //             "sepiaEnabled": false,
    //             "grayscaleEnabled": false,
    //             "shadowEnabled": false,
    //             "shadowBlur": 5,
    //             "shadowOffsetX": 0,
    //             "shadowOffsetY": 0,
    //             "shadowColor": "black",
    //             "shadowOpacity": 1,
    //             "draggable": true,
    //             "resizable": true,
    //             "contentEditable": true,
    //             "styleEditable": true,
    //             "src": "https://images.unsplash.com/photo-1672872476232-da16b45c9001?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MHwxfGFsbHwzfHx8fHx8Mnx8MTY3Mjk0ODgxNQ&ixlib=rb-4.0.3&q=80&w=1080",
    //             "cropX": 0,
    //             "cropY": 0,
    //             "cropWidth": 1,
    //             "cropHeight": 0.6546171171171171,
    //             "cornerRadius": 0,
    //             "flipX": false,
    //             "flipY": false,
    //             "clipSrc": "",
    //             "borderColor": "black",
    //             "borderSize": 0,
    //             "keepRatio": false
    //           }
    //         ],
    //         "width": "auto",
    //         "height": "auto",
    //         "background": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTY5OTZ8MHwxfHNlYXJjaHw0fHxwYXR0ZXJufGVufDB8fHx8MTY3MjkxODgxOQ&ixlib=rb-4.0.3&q=80&w=1080",
    //         "bleed": 0
    //       }
    //     ],
    //     "unit": "px",
    //     "dpi": 72
    //   }
    //   ${"```"}

    //   Here are a few additional instructions.
    //   1: Return only the json object.
    //   2: For images use https://images.unsplash.com/.
    //   3: For icons you can use the following url format https://img.icons8.com/size/style/keyword for example https://img.icons8.com/512/doodle/heart.
    //   `,
    //   },
    // ];

    if (!promptText?.length) {
      alert("No system prompt!");
      return;
    }

    const messages = [
      {
        role: "system",
        content: promptText,
      },
    ];

    if (contentHistory?.length) {
      contentHistory.map((history) => {
        messages.push({ role: "user", content: history?.prompt });
        messages.push({
          role: "assistant",
          content: JSON.stringify(history?.json),
        });
      });
    }

    messages.push({ role: "user", content: textContent });

    try {
      reset();
      start();

      const { data, loading, error } = await client.query({
        query: chatGPT,
        variables: { messages },
      });

      if (error) {
        alert(JSON.stringify(error));
        pause();
        return;
      }

      const json = JSON.parse(data?.chatGPT?.content);

      console.log(json);
      const defaultJson =
        contentHistory?.length > 0
          ? contentHistory?.[contentHistory?.length - 1]?.json
          : {
              id: "design_id",
              width: 1080,
              height: 1080,
              fonts: [],
              pages: [
                {
                  id: "page_id",
                  children: [],
                  width: "auto",
                  height: "auto",
                  background: "",
                  bleed: 0,
                },
              ],
              unit: "px",
              dpi: 72,
            };

      if (!contentHistory?.length) {
        json.pages = json.pages?.map(page => {
          let {children} = page;
          children = children?.map((child) => {
            let additional = {};
            const { type } = child;
            switch (type) {
              case "svg":
                additional = svgDefaults;
                break;
              case "text":
                additional = textDefaults;
                break;
              case "image":
                additional = imageDefaults;
                break;
            }
            return { ...additional, ...child };
          });

          return {...defaultJson?.pages?.[0], ...page, children}
        })
      }

      console.log(defaultJson, json);
      const finalJson = { ...defaultJson, ...json };
      console.log(finalJson);

      window.store.loadJSON(finalJson);

      setContentHistory([
        ...contentHistory,
        { json, prompt: textContent, time: finalTime },
      ]);

      pause();

      setTextContent("");
    } catch (e) {
      console.log(e)
      alert(JSON.stringify(e));
      pause();
    }
  };

  function formatTime(value) {
    const parts = value.split(":");
    const minutes = String(parts[1]).padStart(2, "0");
    const seconds = String(parts[2]).padStart(2, "0");
    return `${parts[0]}:${minutes}:${seconds}`;
  }

  return (
    <div style={{ height: "100%" }}>
      {isLoading && <div>Loading...</div>}
      {isLoading && (
        <div style={{ padding: "30px" }}>
          <Spinner />
        </div>
      )}
      {!isLoading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "5px",
          }}
        >
          <Text>Tell me what you need! &nbsp;</Text>
          <TextArea
            style={{ marginTop: "10px" }}
            fill={true}
            onChange={onInputChange}
            value={textContent}
            placeholder="Post about the galaxy"
          />
          <Button
            style={{ marginTop: "10px" }} // alignSelf: "flex-end",
            text="Generate"
            icon={"circle-arrow-right"}
            onClick={runChat}
          />
          {isRunning && (
            <Text
              style={{ alignSelf: "center", marginTop: 10, marginBottom: 10 }}
            >
              Wait up to 3 minutes{" "}
              {formatTime(`${hours}:${minutes}:${seconds}`)}
            </Text>
          )}
          {contentHistory?.length > 0 && (
            <div>
              <Divider style={{ marginTop: "30px", marginBottom: "20px" }} />
              <Text style={{ color: "lightgray", marginBottom: "10px" }}>
                History &nbsp;
              </Text>
              {contentHistory?.map((history, index) => {
                return (
                  <div
                    onClick={() => window.store?.loadJSON(history?.json)}
                    key={index}
                    style={{
                      margin: "5px",
                      marginTop: "10px",
                      marginBottom: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <Text>
                      {index + 1}: {history?.prompt}{" "}
                      <span style={{ color: "gray" }}>
                        - Time: {formatTime(history?.time)}
                      </span>
                    </Text>
                  </div>
                );
              })}
              <Divider style={{ marginTop: "20px", marginBottom: "10px" }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// define the new custom section
export const ChatSection = {
  name: "chat-gpt",
  Tab: (props) => (
    <SectionTab name="ChatGPT" {...props}>
      <ChatSVG />
    </SectionTab>
  ),
  visibleInList: true,
  // we need observer to update component automatically on any store changes
  Panel: ChatPanel,
};
