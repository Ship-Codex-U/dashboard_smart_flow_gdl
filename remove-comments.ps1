$files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Remover {/* ... */}
    $content = [regex]::Replace($content, '(?s)^[ \t]*\{\/\*.*?\*\/\}[ \t]*\r?\n', '', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $content = [regex]::Replace($content, '(?s)\{\/\*.*?\*\/\}', '')
    
    # Remover /* ... */
    $content = [regex]::Replace($content, '(?s)^[ \t]*\/\*.*?\*\/[ \t]*\r?\n', '', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    $content = [regex]::Replace($content, '(?s)\/\*.*?\*\/', '')
    
    # Remover //
    $content = [regex]::Replace($content, '(?m)^[ \t]*//.*?\r?\n', '')
    
    # Limpiar lineas multiples
    $content = [regex]::Replace($content, '(\r?\n){3,}', "`r`n`r`n")
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
}
Write-Output "Comentarios eliminados con PowerShell."
