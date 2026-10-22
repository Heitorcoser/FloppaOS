package com.heitor.moscapilota;

import android.content.Intent;
import android.net.Uri;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

// Abre o seletor de arquivos do Android quando a página pede a ROM
public class Escolhedor extends WebChromeClient {
    private final MainActivity a;

    public Escolhedor(MainActivity a) {
        this.a = a;
    }

    @Override
    public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
        if (a.arquivoCb != null) a.arquivoCb.onReceiveValue(null);
        a.arquivoCb = cb;
        Intent i = new Intent(Intent.ACTION_GET_CONTENT);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        i.setType("*/*");
        try {
            a.startActivityForResult(Intent.createChooser(i, "Escolha a ROM"), MainActivity.ESCOLHE);
        } catch (Exception e) {
            a.arquivoCb = null;
            return false;
        }
        return true;
    }
}
