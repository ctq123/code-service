import { Controller, Get, Provide } from '@midwayjs/decorator';
import * as parser from "@babel/parser";
import traverse from '@babel/traverse';

@Provide()
@Controller('/')
export class HomeController {
  @Get('/')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }
  @Get('/test')
  async test(): Promise<string> {
    const code = `/* eslint-disable consistent-return */
    import { useRef, useState } from 'react';
    import * as API from './api';
    import * as GAPI from '@/api';
    import { getUserInfo, getUserName as getUserName2 } from '@global/utils/user';
    import { getUserName } from '@global/utils/user';
    
    const { TextArea } = Input;
    // 商品信息反馈页面
    export const GoodsFeedback = () => {
      const [resolveModalVisible, setResolveModalVisible] = useState(false);
      const [remarkModalVisible, setRemarkModalVisible] = useState(false);
      const [resolveVal, setResolveVal] = useState('');
    }`;
    const importMap: any = {};
    const ast = parser.parse(code, {
      sourceType: 'module',
    });
    // console.log('ast', ast);
    // console.log('ast.program', ast.program)
    // console.log('ast.program.body', ast.program.body);
    // if (Array.isArray(ast?.program?.body)) {
    //   ast.program.body.forEach(item => {
    //     console.log('item', item);
    //   });
    // }
    traverse(ast, {
      ImportDeclaration: (path: any) => {
        // console.log('path.node.source', path.node.source);
        const fromFileKey = path?.node?.source?.value;
        // console.log('path.node.specifiers', path.node.specifiers);
        if (Array.isArray(path?.node?.specifiers)) {
          path.node.specifiers.forEach(item => {
            const importName = item?.imported?.name;
            const localName = item?.local?.name;
            const name = importName || localName;
            if (name) {
              const importKey = `${fromFileKey || ''}-${name}`;
              if (!importMap[importKey]) {
                importMap[importKey] = 1;
              } else {
                importMap[importKey]++;
              }
            }
          });
        }
        console.log('importMap', importMap);
      },
    });
    return 'Hello test';
  }
}
