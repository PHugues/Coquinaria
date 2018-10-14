#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from tkinter import ttk, Tk, font

HUGE_FONT = ('TkDefaultFont', 20)
BIG_FONT = ('TkDefaultFont', 12)
NORM_FONT = ('TkDefaultFont', 10)
SMALL_FONT = ('TkDefaultFont', 8)


def popupmsg(msg):
    """Create a popup message"""
    popup = Tk()
    popup.wm_title("Erreur")
    label = ttk.Label(popup, text=msg, font=NORM_FONT)
    label.pack(side="top", fill="x", pady=10, padx=10)
    B1 = ttk.Button(popup, text="Okay", command=popup.destroy)
    B1.pack(padx=5, pady=10)
    popup.mainloop()
