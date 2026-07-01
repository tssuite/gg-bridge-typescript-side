import 'dart:convert';
import 'dart:io';

Future<void> main(List<String> args) async {
  // Only enforce the check on the main or master branch.
  final currentBranch = await _currentGitBranchOrNull();
  if (currentBranch == null) {
    stdout.writeln(
      '[pre-push] INFO: Could not determine current branch, '
      'skipping "gg did commit" check.',
    );
    return;
  }

  if (!_isProtectedBranch(currentBranch)) {
    stdout.writeln(
      '[pre-push] INFO: Branch "$currentBranch" is not protected '
      '(main/master), skipping "gg did commit" check.',
    );
    return;
  }

  final repoRoot = await _gitTopLevelOrNull();
  if (repoRoot != null) {
    Directory.current = repoRoot;
  }

  final result = await _runPipeAndCapture('gg', ['did', 'commit']);

  final okExit = result.exitCode == 0;
  final okText = result.combinedOutput.contains(
    '✅ All changes are committed',
  );

  if (!okExit || !okText) {
    stderr.writeln(
      '\n[pre-push] BLOCKED: "gg did commit" '
      'did not confirm "All changes are committed". '
      '(exit code ${result.exitCode})',
    );
    exitCode = okExit ? 1 : result.exitCode;
  } else {
    stdout.writeln('[pre-push] OK');
  }
}

class _RunResult {
  final int exitCode;
  final String combinedOutput;

  _RunResult(this.exitCode, this.combinedOutput);
}

Future<_RunResult> _runPipeAndCapture(
  String executable,
  List<String> arguments,
) async {
  try {
    final process = await Process.start(
      executable,
      arguments,
      runInShell: Platform.isWindows,
    );

    final buffer = StringBuffer();

    // stdout live + capture
    final stdoutSub = process.stdout.listen((chunk) {
      stdout.add(chunk);
      buffer.write(utf8.decode(chunk, allowMalformed: true));
    });

    // stderr live + capture (in case gg writes there)
    final stderrSub = process.stderr.listen((chunk) {
      stderr.add(chunk);
      buffer.write(utf8.decode(chunk, allowMalformed: true));
    });

    final code = await process.exitCode;
    await stdoutSub.cancel();
    await stderrSub.cancel();

    return _RunResult(code, buffer.toString());
  } on ProcessException catch (e) {
    stderr.writeln('[pre-push] Could not run "$executable": ${e.message}');
    // If gg is not available, block the push.
    return _RunResult(127, '');
  }
}

Future<String?> _gitTopLevelOrNull() async {
  try {
    final res = await Process.run(
      'git',
      ['rev-parse', '--show-toplevel'],
      runInShell: Platform.isWindows,
    );
    if (res.exitCode != 0) {
      return null;
    }
    return (res.stdout as String).trim();
  } catch (_) {
    return null;
  }
}

Future<String?> _currentGitBranchOrNull() async {
  try {
    final res = await Process.run(
      'git',
      ['rev-parse', '--abbrev-ref', 'HEAD'],
      runInShell: Platform.isWindows,
    );
    if (res.exitCode != 0) {
      return null;
    }
    final branch = (res.stdout as String).trim();
    if (branch.isEmpty || branch == 'HEAD') {
      return null;
    }
    return branch;
  } catch (_) {
    return null;
  }
}

bool _isProtectedBranch(String branchName) {
  final normalized = branchName.trim();
  return normalized == 'main' || normalized == 'master';
}
