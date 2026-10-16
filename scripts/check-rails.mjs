import {execFileSync} from 'node:child_process';
for(const file of ['clock','whole-digit','startup','new-modes','letter-transition','letter-carousel'])execFileSync(process.execPath,[`tests/rails/${file}.cjs`],{stdio:'inherit'});
