// The read-only capture step shared by Ryux Analyze and Ryux Critique: how to see the real design
// before saying anything about it. Embedded in both skills by analyze.ts and critique.ts.

export const CAPTURE_TABLE = `| Source | How to capture | If it is not available |
| --- | --- | --- |
| Figma link (\`figma.com/design/<fileKey>/...?node-id=1-2\`) | Figma MCP: \`get_screenshot\` with the file key and node id (turn \`1-2\` into \`1:2\`) for the image; \`get_metadata\` for the frame tree; \`get_design_context\` and \`get_variable_defs\` for text, components, and variables (measured values) | Ask for a PNG export of the frames, or for the Figma MCP to be connected |
| pen.dev design | pencil MCP: \`get_app_state\` to list frames; \`execute\` with \`TakeScreenshot([frameId])\` for the image, and a \`Get\` visitor that prints text nodes, node properties (fonts, sizes, fills, gaps), and any \`ctx.problems\` (clipped content) | Ask for an exported PNG |
| Website URL | \`npx playwright screenshot --full-page --viewport-size=1440,900 <url> desktop.png\` and \`--viewport-size=390,844\` for mobile; a browser tool for interaction states (hover, focus, an error) when one is available; the page HTML and CSS for headings, labels, alt text, landmarks, and declared values | Ask for screenshots at desktop and mobile width |
| Screenshot or image | Read the image directly | none |
| Code only | Render it first (see \`ryux-visual-qa\`) | Work from the code and state that it was not rendered |

Stay read-only: do not edit the Figma file, the pen.dev document, or the site. Record what you
captured: the frames or URLs, the viewports, and the tools.`;
