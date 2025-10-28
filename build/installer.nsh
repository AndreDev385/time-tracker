!macro customInstall
  # Create startup shortcut
  CreateShortcut "$SMSTARTUP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_NAME}.exe"
!macroend

!macro customUnInstall
  # Remove startup shortcut
  Delete "$SMSTARTUP\${PRODUCT_NAME}.lnk"
!macroend