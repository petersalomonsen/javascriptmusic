#include <stdio.h>
#include <string>
#include <vector>
#include <iostream>
#include "./instrumentdisassembler.h"

using namespace std;

DWORD versiontag10 = 0x30316b34; // 4k10
DWORD versiontag11 = 0x31316b34; // 4k11
DWORD versiontag12 = 0x346b3132; // 4k12
DWORD versiontag13 = 0x33316b34; // 4k13
DWORD versiontag   = 0x34316b34; // 4k14

SynthObject SynthObj;

void disassembleInstruments() {

			
	

	FILE *file = fdopen(fileno(stdout), "w");
	fprintf(file, "%%ifdef USE_SECTIONS\n");
	fprintf(file, "section .g4kmuc3 data align=1\n");
	fprintf(file, "%%else\n");
	fprintf(file, "section .data\n");
	fprintf(file, "%%endif\n");
	fprintf(file, "go4k_synth_instructions\n");
	char comstr[1024];
	std::string CommandString;

	std::vector<WORD> delay_times;
	std::vector<int> delay_indices;
	bool hasReverb = false;
	bool hasNoteSync = false;
	int mergeMaxInst = 1;
	int maxinst = 1;
	bool InstrumentUsed[MAX_INSTRUMENTS];
	int InstrumentIndex[MAX_INSTRUMENTS];
#ifdef _8KLANG
	// add primary plugin commands first
	fprintf(file, "%s", mergeCommandString.c_str());
#endif
	for (int i = 0; i < MAX_INSTRUMENTS; i++)
	{
		
		sprintf(comstr, "GO4K_BEGIN_CMDDEF(Instrument%d)\n", i + mergeMaxInst); CommandString += comstr;
		for (int u = 0; u < MAX_UNITS; u++)
		{
			comstr[0] = 0;

			// cout << "CMD " << i << " " << u << " " << (int)SynthObj.InstrumentValues[i][u][0] << endl;
			
			if (SynthObj.InstrumentValues[i][u][0] == M_ENV)
				sprintf(comstr, "\tdb GO4K_ENV_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_VCO)
				sprintf(comstr, "\tdb GO4K_VCO_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_VCF)
				sprintf(comstr, "\tdb GO4K_VCF_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_DST)
				sprintf(comstr, "\tdb GO4K_DST_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_DLL)
				sprintf(comstr, "\tdb GO4K_DLL_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_FOP)
				sprintf(comstr, "\tdb GO4K_FOP_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_FST)
			{
				FST_valP v = (FST_valP)(SynthObj.InstrumentValues[i][u]);
				// local storage
				if (v->dest_stack == -1 || v->dest_stack == i)
					sprintf(comstr, "\tdb GO4K_FST_ID\n"); 
				// global storage
				else
					sprintf(comstr, "\tdb GO4K_FSTG_ID\n"); 
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_PAN)
				sprintf(comstr, "\tdb GO4K_PAN_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_OUT)
				sprintf(comstr, "\tdb GO4K_OUT_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_ACC)
				sprintf(comstr, "\tdb GO4K_ACC_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_FLD)
				sprintf(comstr, "\tdb GO4K_FLD_ID\n"); 
			if (SynthObj.InstrumentValues[i][u][0] == M_GLITCH)
				sprintf(comstr, "\tdb GO4K_GLITCH_ID\n"); 

			CommandString += comstr;
		}			
		sprintf(comstr, "GO4K_END_CMDDEF\n"); CommandString += comstr;
	};
	fprintf(file, "%s", CommandString.c_str());

	fprintf(file, "GO4K_BEGIN_CMDDEF(Global)\n");
	for (int u = 0; u < MAX_UNITS; u++)
	{
		if (SynthObj.GlobalValues[u][0] == M_ENV)
			fprintf(file, "\tdb GO4K_ENV_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_VCO)
			fprintf(file, "\tdb GO4K_VCO_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_VCF)
			fprintf(file, "\tdb GO4K_VCF_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_DST)
			fprintf(file, "\tdb GO4K_DST_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_DLL)
			fprintf(file, "\tdb GO4K_DLL_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_FOP)
			fprintf(file, "\tdb GO4K_FOP_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_FST)
		{
			FST_valP v = (FST_valP)(SynthObj.GlobalValues[u]);
			// local storage
			if (v->dest_stack == -1 || v->dest_stack == MAX_INSTRUMENTS)
				fprintf(file, "\tdb GO4K_FST_ID\n");
			// global storage
			else
				fprintf(file, "\tdb GO4K_FSTG_ID\n");
		}
		if (SynthObj.GlobalValues[u][0] == M_PAN)
			fprintf(file, "\tdb GO4K_PAN_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_OUT)
			fprintf(file, "\tdb GO4K_OUT_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_ACC)
			fprintf(file, "\tdb GO4K_ACC_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_FLD)
			fprintf(file, "\tdb GO4K_FLD_ID\n");
		if (SynthObj.GlobalValues[u][0] == M_GLITCH)
			fprintf(file, "\tdb GO4K_GLITCH_ID\n");
	}
	fprintf(file, "GO4K_END_CMDDEF\n");
	fprintf(file, "go4k_synth_instructions_end\n");
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// the instrument data
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	fprintf(file, "%%ifdef USE_SECTIONS\n");
	fprintf(file, "section .g4kmuc4 data align=1\n");
	fprintf(file, "%%else\n");
	fprintf(file, "section .data\n");
	fprintf(file, "%%endif\n");
	fprintf(file, "go4k_synth_parameter_values\n");
	int delayindex = 0;
	char valstr[1024];
	std::string ValueString;
#ifdef _8KLANG
	// add primary plugin values first
	fprintf(file, "%s", mergeValueString.c_str());
#endif
	for (int i = 0; i < MAX_INSTRUMENTS; i++)
	{
		if (!InstrumentUsed[i]) continue;
		sprintf(valstr, "GO4K_BEGIN_PARAMDEF(Instrument%d)\n", i + mergeMaxInst); ValueString += valstr;
		for (int u = 0; u < MAX_UNITS; u++)
		{
			valstr[0] = 0;

			if (SynthObj.InstrumentValues[i][u][0] == M_ENV)
			{
				ENV_valP v = (ENV_valP)(SynthObj.InstrumentValues[i][u]);
				sprintf(valstr, "\tGO4K_ENV\tATTAC(%d),DECAY(%d),SUSTAIN(%d),RELEASE(%d),GAIN(%d)\n", v->attac, v->decay, v->sustain, v->release, v->gain);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_VCO)
			{
				VCO_valP v = (VCO_valP)(SynthObj.InstrumentValues[i][u]);
				char type[16]; type[0] = 0;
				char lfo[16]; lfo[0] = 0;
				char stereo[16]; stereo[0] = 0;
				if (v->flags & VCO_SINE)
					sprintf(type, "SINE");
				if (v->flags & VCO_TRISAW)
					sprintf(type, "TRISAW");
				if (v->flags & VCO_PULSE)
					sprintf(type, "PULSE");
				if (v->flags & VCO_NOISE)
					sprintf(type, "NOISE");
				if (v->flags & VCO_GATE)
					sprintf(type, "GATE");
				if (v->flags & VCO_LFO)
					sprintf(lfo, "|LFO");
				if (v->flags & VCO_STEREO)
					sprintf(stereo, "|VCO_STEREO");
				sprintf(valstr, "\tGO4K_VCO\tTRANSPOSE(%d),DETUNE(%d),PHASE(%d),GATES(%d),COLOR(%d),SHAPE(%d),GAIN(%d),FLAGS(%s%s%s)\n", v->transpose, v->detune, v->phaseofs, v->gate, v->color, v->shape, v->gain, type, lfo, stereo);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_VCF)
			{
				VCF_valP v = (VCF_valP)(SynthObj.InstrumentValues[i][u]);
				char type[16]; type[0] = 0;
				char stereo[16]; stereo[0] = 0;
				int t = v->type & ~VCF_STEREO;
				if (t == VCF_LOWPASS)
					sprintf(type, "LOWPASS");
				if (t == VCF_HIGHPASS)
					sprintf(type, "HIGHPASS");
				if (t == VCF_BANDPASS)
					sprintf(type, "BANDPASS");
				if (t == VCF_BANDSTOP)
					sprintf(type, "BANDSTOP");
				if (t == VCF_ALLPASS)
					sprintf(type, "ALLPASS");
				if (t == VCF_PEAK)
					sprintf(type, "PEAK");
				if (v->type & VCF_STEREO)
					sprintf(stereo, "|STEREO");
				sprintf(valstr, "\tGO4K_VCF\tFREQUENCY(%d),RESONANCE(%d),VCFTYPE(%s%s)\n", v->freq, v->res, type, stereo);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_DST)
			{
				DST_valP v = (DST_valP)(SynthObj.InstrumentValues[i][u]);
				sprintf(valstr, "\tGO4K_DST\tDRIVE(%d), SNHFREQ(%d), FLAGS(%s)\n", v->drive, v->snhfreq, v->stereo & VCF_STEREO ? "STEREO" : "0");
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_DLL)
			{
				DLL_valP v = (DLL_valP)(SynthObj.InstrumentValues[i][u]);
				if (v->delay < delay_indices.size())
				{
					sprintf(valstr, "\tGO4K_DLL\tPREGAIN(%d),DRY(%d),FEEDBACK(%d),DAMP(%d),FREQUENCY(%d),DEPTH(%d),DELAY(%d),COUNT(%d)\n", 
						v->pregain, v->dry, v->feedback, v->damp, v->freq, v->depth, delay_indices[v->delay], v->count);	
				}
				// error handling in case indices are fucked up
				else
				{
					sprintf(valstr, "\tGO4K_DLL\tPREGAIN(%d),DRY(%d),FEEDBACK(%d),DAMP(%d),FREQUENCY(%d),DEPTH(%d),DELAY(%d),COUNT(%d) ; ERROR\n", 
						v->pregain, v->dry, v->feedback, v->damp, v->freq, v->depth, v->delay, v->count);
				}
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_FOP)
			{
				FOP_valP v = (FOP_valP)(SynthObj.InstrumentValues[i][u]);
				char type[16]; type[0] = 0;
				if (v->flags == FOP_POP)
					sprintf(type, "FOP_POP");
				if (v->flags == FOP_PUSH)
					sprintf(type, "FOP_PUSH");
				if (v->flags == FOP_XCH)
					sprintf(type, "FOP_XCH");
				if (v->flags == FOP_ADD)
					sprintf(type, "FOP_ADD");
				if (v->flags == FOP_ADDP)
					sprintf(type, "FOP_ADDP");
				if (v->flags == FOP_MUL)
					sprintf(type, "FOP_MUL");
				if (v->flags == FOP_MULP)
					sprintf(type, "FOP_MULP");
				if (v->flags == FOP_ADDP2)
					sprintf(type, "FOP_ADDP2");
				if (v->flags == FOP_LOADNOTE)
					sprintf(type, "FOP_LOADNOTE");
				if (v->flags == FOP_MULP2)
					sprintf(type, "FOP_MULP2");
				sprintf(valstr, "\tGO4K_FOP\tOP(%s)\n", type);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_FST)
			{
				FST_valP v = (FST_valP)(SynthObj.InstrumentValues[i][u]);
				// local storage
				if (v->dest_stack == -1 || v->dest_stack == i)
				{
					// skip empty units on the way to target
					int emptySkip = 0;
					for (int e = 0; e < v->dest_unit; e++)
					{
						if (SynthObj.InstrumentValues[i][e][0] == M_NONE)
							emptySkip++;
					}
					std::string modes;
					modes = "FST_SET";
					if (v->type & FST_ADD)
						modes = "FST_ADD";
					//if (v->type & FST_MUL)
					//	modes = "FST_MUL";
					if (v->type & FST_POP)
						modes += "+FST_POP";
					sprintf(valstr, "\tGO4K_FST\tAMOUNT(%d),DEST(%d*MAX_UNIT_SLOTS+%d+%s)\n", v->amount, v->dest_unit-emptySkip, v->dest_slot, modes.c_str() );
				}
				// global storage
				else
				{
					int storestack;
					if (v->dest_stack == MAX_INSTRUMENTS)
						storestack = maxinst;
					else
						storestack = InstrumentIndex[v->dest_stack] + mergeMaxInst;
					// skip empty units on the way to target
					int emptySkip = 0;
					for (int e = 0; e < v->dest_unit; e++)
					{
						if (v->dest_stack == MAX_INSTRUMENTS)
						{
							if (SynthObj.GlobalValues[e][0] == M_NONE)
								emptySkip++;
						}
						else
						{
							if (SynthObj.InstrumentValues[v->dest_stack][e][0] == M_NONE)
								emptySkip++;
						}
					}
					// invalid store target, possibly due non usage of the target instrument
					if (storestack == -1)
					{
						sprintf(valstr, "\tGO4K_FSTG\tAMOUNT(0),DEST(7*4+go4k_instrument.workspace)\n");
					}
					else
					{
						std::string modes;
						modes = "FST_SET";
						if (v->type & FST_ADD)
							modes = "FST_ADD";
						//if (v->type & FST_MUL)
						//	modes = "FST_MUL";
						if (v->type & FST_POP)
							modes += "+FST_POP";
						sprintf(valstr, "\tGO4K_FSTG\tAMOUNT(%d),DEST((%d*go4k_instrument.size*MAX_VOICES/4)+(%d*MAX_UNIT_SLOTS+%d)+(go4k_instrument.workspace/4)+%s)\n", v->amount, storestack, v->dest_unit-emptySkip, v->dest_slot, modes.c_str());
					}
				}
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_PAN)
			{
				PAN_valP v = (PAN_valP)(SynthObj.InstrumentValues[i][u]);
				sprintf(valstr, "\tGO4K_PAN\tPANNING(%d)\n", v->panning);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_OUT)
			{
				OUT_valP v = (OUT_valP)(SynthObj.InstrumentValues[i][u]);
				sprintf(valstr, "\tGO4K_OUT\tGAIN(%d), AUXSEND(%d)\n", v->gain, v->auxsend);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_ACC)
			{
				ACC_valP v = (ACC_valP)(SynthObj.InstrumentValues[i][u]);
				if (v->flags == ACC_OUT)
					sprintf(valstr, "\tGO4K_ACC\tACCTYPE(OUTPUT)\n");
				else
					sprintf(valstr, "\tGO4K_ACC\tACCTYPE(AUX)\n");
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_FLD)
			{
				FLD_valP v = (FLD_valP)(SynthObj.InstrumentValues[i][u]);
				sprintf(valstr, "\tGO4K_FLD\tVALUE(%d)\n", v->value);
			}
			if (SynthObj.InstrumentValues[i][u][0] == M_GLITCH)
			{
				GLITCH_valP v = (GLITCH_valP)(SynthObj.InstrumentValues[i][u]);
				if (v->delay < delay_indices.size())
				{
					sprintf(valstr, "\tGO4K_GLITCH\tACTIVE(%d),DRY(%d),SLICEFACTOR(%d),PITCHFACTOR(%d),SLICESIZE(%d)\n", 
						v->active, v->dry, v->dsize, v->dpitch, delay_indices[v->delay]);	
				}
				// error handling in case indices are fucked up
				else
				{
					sprintf(valstr, "\tGO4K_GLITCH\tACTIVE(%d),DRY(%d),SLICEFACTOR(%d),PITCHFACTOR(%d),SLICESIZE(%d) ; ERROR\n",
						v->active, v->dry, v->dsize, v->dpitch, v->delay);	
				}
			}

			ValueString += valstr;
		}
		sprintf(valstr, "GO4K_END_PARAMDEF\n"); ValueString += valstr;
	}
	fprintf(file, "%s", ValueString.c_str());
}

// load instrumen data to specified channel
bool Go4kVSTi_LoadInstrument(char* filename, char channel)
{
	FILE *file = fopen(filename, "rb");
	if (file)
	{

		DWORD version = 0;
		bool version10 = false;
		bool version11 = false;
		bool version12 = false;
		bool version13 = false;
		fread(&version, 1, 4, file);		
		
		printf("%2x %2x\n", (int)version, (int)versiontag);
		if (versiontag != version) // 4k10
		{
			// version 1.3 file
			if (version == versiontag13)
			{
				// only mulp2 unit added and layout for instruments changed, no need for message
				//MessageBox(0,"Autoconvert. Please save file again", "1.3 File Format", MB_OK | MB_SETFOREGROUND);
				version13 = true;
			}
			// version 1.2 file
			else if (version == versiontag12)
			{
				// only fld unit added, no need for message
				//MessageBox(0,"Autoconvert. Please save file again", "1.2 File Format", MB_OK | MB_SETFOREGROUND);
				version12 = true;
				version13 = true;
			}
			// version 1.1 file
			else if (version == versiontag11)
			{
				version11 = true;
				version12 = true;
				version13 = true;
			}
			// version 1.0 file
			else if (version == versiontag10)
			{
				version10 = true;
				version11 = true;
				version12 = true;
				version13 = true;
			}
			// newer format than supported
			else
			{
				printf("newer format than supported\n");
				fclose(file);
				return false;
			}
		}
		
		//
		printf("CHANNEL %d\n", channel);
		if (channel < 16)
		{
			fread(SynthObj.InstrumentNames[channel], 1, 64, file);
			
			if (version13)
			{
				BYTE dummyBuf[16];
				for (int j = 0; j < 32; j++) // 1.3 format had 32 units
				{
					fread(SynthObj.InstrumentValues[channel][j], 1, 16, file); // 1.3 format had 32 unit slots, but not fully used
					fread(dummyBuf, 1, 16, file); // 1.3 read remaining block to dummy
				}
			}
			else
				fread(SynthObj.InstrumentValues[channel], 1, MAX_UNITS*MAX_UNIT_SLOTS, file);	
			
		}
		
		fclose(file);
		return true;
	} else {
		printf("Unable to open file %s\n",filename);
		return false;
	}
}

int main( int argc, char *argv[] ) {
	
	if(Go4kVSTi_LoadInstrument(argv[1], 0)) {
		disassembleInstruments();	
	}	
}