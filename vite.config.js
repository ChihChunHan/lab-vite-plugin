import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AST from "unplugin-ast/vite";
import { RemoveNode } from "unplugin-ast/transformers";

function removeDefineStub() {
  // get the code between the $http function
  // and remove the $defineStub properties in it

  return {
    name: "remove-define-stub",
    transform(code, id) {
      if (id.endsWith("src/main.js")) {

        const bucketCodeHandler =
          (identifier, bucket = ["{", "}"], callback = false) =>
          (code) => {
            const identifierLength = identifier.length;
            let startIndex = code.indexOf(identifier);
            while (startIndex !== -1) {
              let pin = startIndex + identifierLength;
              let bracketDepth = 0;
              while (
                !(code[pin - 1] === bucket[1] && bracketDepth === 0) &&
                code[pin]
              ) {
                if (code[pin] === bucket[0]) {
                  bracketDepth++;
                } else if (code[pin] === bucket[1]) {
                  bracketDepth--;
                }
                pin++;
              }
              if (callback) {
                code = callback(code, startIndex, pin);
              }
              startIndex = code.indexOf(identifier, startIndex + 1);
            }
            return code;
          };

        const removeDefineStubProperties = bucketCodeHandler(
          "$defineStub",
          ["{", "}"],
          (code, startIndex, pin) => {
            let keepTail = false;
            if (code[pin] === ",") {
              keepTail = true;
            }
            code =
              code.slice(0, startIndex) + code.slice(pin + (keepTail ? 1 : 0));
            return code;
          }
        );

        const removeHttpContextStubHandler = bucketCodeHandler(
          "$http",
          ["(", ")"],
          (code, startIndex, pin) => {
            const httpParamStringContent = code.slice(startIndex + 5, pin);
            const newParamStringContent = removeDefineStubProperties(
              httpParamStringContent
            );
            code =
              code.slice(0, startIndex + 5) +
              newParamStringContent +
              code.slice(pin);
            return code;
          }
        );

        removeHttpContextStubHandler(code);

        return removeDefineStubProperties(code);
      }
      return code;
    },
  };
}

function defineStubTypeChecker() {
  // not allowing nested object value is variable
  const matches = [];

  return AST({
    include: [/\.js$/],
    transformer: [
      RemoveNode((node, parent) => {
        if (!parent) return;

        const checkIsSameNode = (n1, n2) =>
          n1.loc.start.index === n2.loc.start.index &&
          n1.loc.end.index === n2.loc.end.index;
        const isInDefineStubPropContext = (matches) => matches.length > 0;
        const isDefineStubProps = (node) => node?.key?.name === "$defineStub";
        const foundDefineStubRootNode =
          parent.type === "ObjectExpression" && isDefineStubProps(node);
        if (foundDefineStubRootNode) {
          matches.push(node);
        } else if (isDefineStubProps(matches[0])) {
          while (
            isInDefineStubPropContext(matches) &&
            parent !== matches.at(-1)
          ) {
            matches.pop();
          }

          if (isInDefineStubPropContext(matches)) {
            const isIdentifier = node.type === "Identifier";
            const isPropertyKey =
              parent.type === "ObjectProperty" &&
              checkIsSameNode(parent.key, node);
            const isShortHandProperty =
              parent.type === "ObjectProperty" &&
              checkIsSameNode(parent.value, node);
            const isVariable =
              isIdentifier && (!isPropertyKey || isShortHandProperty);

            if (isVariable) {
              console.error(parent, node);
              throw new Error(
                `Not allowed to use variable as value in $defineStub: ${node.name}`
              );
            }
            matches.push(node);
          }
        }
      }),
    ],
  });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // defineStubTypeChecker(),
    removeDefineStub(),
  ],
});
