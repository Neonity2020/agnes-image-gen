import { Annotation, END, START, StateGraph } from "@langchain/langgraph"

import { generateImage, generateText, generateVideo } from "@/lib/agnes"
import type { GenerationMode } from "@/types"

const AgentState = Annotation.Root({
  prompt: Annotation<string>(),
  mode: Annotation<GenerationMode>(),
  apiKey: Annotation<string>(),
  size: Annotation<string>(),
  referenceImage: Annotation<string | undefined>(),
  text: Annotation<string | undefined>(),
  mediaUrl: Annotation<string | undefined>(),
})

const graph = new StateGraph(AgentState)
  .addNode("route", async () => ({}))
  .addNode("write", async (state) => ({ text: await generateText(state.prompt, state.apiKey) }))
  .addNode("draw", async (state) => ({ mediaUrl: await generateImage(state.prompt, state.size, state.apiKey, state.referenceImage) }))
  .addNode("animate", async (state) => ({ mediaUrl: await generateVideo(state.prompt, state.size, state.apiKey) }))
  .addEdge(START, "route")
  .addConditionalEdges("route", (state) => state.mode, { text: "write", image: "draw", video: "animate" })
  .addEdge("write", END)
  .addEdge("draw", END)
  .addEdge("animate", END)
  .compile()

export function runAgnesAgent(input: {
  prompt: string
  mode: GenerationMode
  apiKey: string
  size: string
  referenceImage?: string
}) {
  return graph.invoke(input)
}
