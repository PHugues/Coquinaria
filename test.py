#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from tkinter import *

tk = Tk()
Button(tk, text="button1").grid(row=1, column=1, sticky=NSEW)
Button(tk, text="button2").grid(row=1, column=2, sticky=NSEW)
Button(tk, text="button3").grid(row=2, column=1, sticky=NSEW)
Button(tk, text="button4").grid(row=2, column=2, sticky=NSEW)

tk.grid_rowconfigure(0, weight=1)
tk.grid_rowconfigure(3, weight=1)
tk.grid_columnconfigure(0, weight=1)
tk.grid_columnconfigure(3, weight=1)

tk.mainloop()