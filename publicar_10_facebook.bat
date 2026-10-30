@echo off
cd /d "%~dp0"
title UmamiCraft - Publicador Facebook (10 Recetas)
color 0A

echo =========================================================================
echo    UMAMICRAFT - PUBLICADOR AUTOMATICO PARA FACEBOOK
echo    Publicando las siguientes 10 recetas pendientes en 3 idiomas...
echo =========================================================================
echo.

python -u publicar_facebook.py --siguientes 10 --pausa 5

echo.
echo =========================================================================
echo    Proceso finalizado. Revisa tu pagina de Facebook.
echo =========================================================================
pause
