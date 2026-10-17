const {execFileSync}=require('child_process');execFileSync(process.execPath,['--test','tests/content.test.cjs'],{stdio:'inherit'});
