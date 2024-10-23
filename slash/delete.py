import discord
from discord.ext import commands
import os
from os.path import join, dirname
import json
from dotenv import load_dotenv

intents = discord.Intents.all()
bot = commands.Bot(command_prefix="!", intents=intents, help_command=None)


load_dotenv(verbose=True)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
guild_id=os.environ.get("GUILD_ID")


# bot起動時
@bot.event
async def on_ready():
    bot.tree.clear_commands(guild=None)
    await bot.tree.sync(guild=None)
    return

bot.run(os.environ.get("BOT_ACCESS_TOKEN"))