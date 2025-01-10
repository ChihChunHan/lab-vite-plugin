import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AST from 'unplugin-ast/vite'
import { RemoveNode } from 'unplugin-ast/transformers'

// Custom plugin to remove all defineStub properties
// function removeDefineStub() {
//   return {
//     name: 'remove-define-stub',
//     transform(code, id) {
//       if (id.endsWith('src/main.js')) {
//         function removeDefineStubProperties(code) {
//           const keyword = "$defineStub";
//           const keywordLength = keyword.length;
//           let startIndex = code.indexOf(keyword);
//           let pin = startIndex + keywordLength;
//           let bracketDepth = 0;
//           let keepTail = false;
//           while(!((code[pin] === ',' || code[pin] === '}') && bracketDepth === 0) ) {
//             if (code[pin] === '{') {
//               bracketDepth++;
//             } else if (code[pin] === '}') {
//               bracketDepth--;
//             }
//             pin++;
//           }
//           if(code[pin] === ',') {
//             keepTail = true;
//           }
//           code = code.slice(0, startIndex) + code.slice(pin + (keepTail ? 1 : 0));
//           if (code.includes(keyword)) {
//             return removeDefineStubProperties(code);
//           } else {
//             return code;
//           }
//         }

//         function remove$httpContextStubHandler(code){
//           const $httpContext = code.match(/\$http\(([^)]+)\)/g);
//           if($httpContext) {

//             code = code.replace(/\$http\(([^)]+)\)/g, (match, p1) => {
//               return `$http(${removeDefineStubProperties(p1)})`;
//             });
//             return remove$httpContextStubHandler(code);
//           } else {
//             return code;
//           }
//         }

//         return remove$httpContextStubHandler(code);

//       }
//       return code;
//     }
//   }
// }

const matches = [];

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), 
    AST({
      include: [/\.js$/],
      transformer: [
        RemoveNode((node,parent)=>{
            const foundDefineStubNode = parent?.type === "ObjectExpression" && node.type === "ObjectProperty" && node.key.name === "$defineStub";
            const isInDefineStubNestedObject = matches.length
            if (foundDefineStubNode) {
              matches.push(node);
            } else if (isInDefineStubNestedObject) {
              while(isInDefineStubNestedObject && parent !== matches.at(-1)) {
                matches.pop();
                console.log("popped", matches.length);
              }
              if(matches.length) {
                matches.push(node);
              }
            }
            console.log(matches.map((node)=>[node?.type,node.loc.start.index,node.loc.end.index].join(",")));
        })
      ]
    }),
  ],
})